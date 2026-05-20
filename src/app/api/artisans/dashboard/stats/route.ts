import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Shipment from "@/models/Shipment";
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [totalProducts, availableProducts] = await Promise.all([
      Product.countDocuments({ artisanId: artisanObjectId }),
      Product.countDocuments({ artisanId: artisanObjectId, isAvailable: true }),
    ]);

    const orderQuery = {
      artisanId: artisanObjectId,
      ...dateFilter,
    };

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(orderQuery),
      Order.countDocuments({
        ...orderQuery,
        status: { $in: ["pending", "confirmed", "processing"] },
      }),
      Order.countDocuments({
        ...orderQuery,
        status: "delivered",
      }),
      Order.aggregate([
        { $match: { ...orderQuery, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const shipmentQuery = {
      artisanId: artisanObjectId,
      ...dateFilter,
    };

    const [
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
    ] = await Promise.all([
      Shipment.countDocuments({
        ...shipmentQuery,
        status: { $in: ["pending", "preparing"] },
      }),
      Shipment.countDocuments({
        ...shipmentQuery,
        status: { $in: ["in_transit", "out_for_delivery"] },
      }),
      Shipment.countDocuments({
        ...shipmentQuery,
        status: "delivered",
      }),
    ]);

    const uniqueCustomers = await Order.distinct("customerId", orderQuery);
    const totalCustomers = uniqueCustomers.length;

    const stats = {
      totalProducts,
      availableProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      totalCustomers,
    };

    return NextResponse.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve statistics" },
      { status: 500 }
    );
  }
}
