import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/Customer";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan("artisan");
    if (!auth || auth.type !== "artisan") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Artisan not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const artisanId = auth.data._id;
    const artisanObjectId = new mongoose.Types.ObjectId(artisanId.toString());

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const orders = await Order.find({ artisanId: artisanObjectId }).lean();

    const customerMap = new Map<string, {
      customerId: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate?: Date;
    }>();

    for (const order of orders) {
      const customerId = order.customerId.toString();
      const existing = customerMap.get(customerId) || {
        customerId,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: undefined,
      };
      existing.totalOrders += 1;
      existing.totalSpent += order.totalAmount;
      if (!existing.lastOrderDate || order.createdAt! > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
      }
      customerMap.set(customerId, existing);
    }

    const customerIds = Array.from(customerMap.keys()).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    let users = await User.find({ _id: { $in: customerIds } })
      .select("fullName email phoneNumber createdAt")
      .lean();

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter((user) => {
        const fullName = `${user.fullName?.firstName || ""} ${user.fullName?.lastName || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = (user.phoneNumber || "").toLowerCase();
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    const customers = users.map((user: any) => {
      const stats = customerMap.get(user._id.toString()) || {
        customerId: user._id.toString(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: undefined,
      };
      return {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        createdAt: user.createdAt || undefined,
      };
    });

    customers.sort((a, b) => {
      if (!a.lastOrderDate && !b.lastOrderDate) return 0;
      if (!a.lastOrderDate) return 1;
      if (!b.lastOrderDate) return -1;
      return b.lastOrderDate.getTime() - a.lastOrderDate.getTime();
    });

    const total = customers.length;
    const paginatedCustomers = customers.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      message: "Customers retrieved successfully",
      data: paginatedCustomers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Dashboard customers error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve customers" },
      { status: 500 }
    );
  }
}
