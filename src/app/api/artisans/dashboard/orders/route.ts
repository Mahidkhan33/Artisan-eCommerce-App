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
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query: any = { artisanId: artisanObjectId };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let orders = await Order.find(query)
      .populate("customerId", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter((order: any) => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(searchLower);
        const customer = order.customerId;
        if (!customer) return orderIdMatch;
        const customerName = `${customer.fullName?.firstName || ""} ${customer.fullName?.lastName || ""}`.toLowerCase();
        const customerEmail = (customer.email || "").toLowerCase();
        return (
          orderIdMatch ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower)
        );
      });
    }

    const total = orders.length;
    const paginatedOrders = orders.slice(skip, skip + limit);

    const transformedOrders = paginatedOrders.map((order: any) => ({
      _id: order._id.toString(),
      orderId: order.orderId,
      customerId: order.customerId?._id?.toString() || order.customerId?.toString() || "",
      customerName: order.customerId
        ? `${order.customerId.fullName?.firstName || ""} ${order.customerId.fullName?.lastName || ""}`.trim() || "Unknown Customer"
        : "Unknown Customer",
      customerEmail: order.customerId?.email || "",
      customerPhone: order.customerId?.phoneNumber || "",
      items: order.items.map((item: any) => ({
        productId: item.productId?.toString() || item.productId || "",
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        total: item.total,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : undefined,
    }));

    return NextResponse.json({
      success: true,
      message: "Orders retrieved successfully",
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Dashboard orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}
