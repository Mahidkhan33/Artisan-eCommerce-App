import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Shipment from "@/models/Shipment";
import Order from "@/models/Order";
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
    if (search) {
      query.$or = [
        { shipmentId: { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate("orderId", "orderId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Shipment.countDocuments(query),
    ]);

    const transformedShipments = shipments.map((shipment: any) => {
      let orderIdValue = "";
      if (shipment.orderId) {
        if (typeof shipment.orderId === "object" && shipment.orderId !== null) {
          orderIdValue = shipment.orderId.orderId || shipment.orderId._id?.toString() || "";
        } else {
          orderIdValue = shipment.orderId.toString();
        }
      }

      return {
        _id: shipment._id.toString(),
        shipmentId: shipment.shipmentId || "",
        orderId: orderIdValue,
        customerName: shipment.customerName || "Unknown Customer",
        customerAddress: shipment.customerAddress,
        status: shipment.status || "pending",
        expectedDeliveryDate: shipment.expectedDeliveryDate
          ? new Date(shipment.expectedDeliveryDate).toISOString()
          : new Date().toISOString(),
        actualDeliveryDate: shipment.actualDeliveryDate
          ? new Date(shipment.actualDeliveryDate).toISOString()
          : undefined,
        trackingNumber: shipment.trackingNumber || undefined,
        carrier: shipment.carrier || undefined,
        createdAt: shipment.createdAt ? new Date(shipment.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: shipment.updatedAt ? new Date(shipment.updatedAt).toISOString() : undefined,
      };
    });

    const shipmentsWithStringOrderIds = transformedShipments.filter(
      (s) => s.orderId && !s.orderId.startsWith("ORD-")
    );
    if (shipmentsWithStringOrderIds.length > 0) {
      const orderObjectIds = shipmentsWithStringOrderIds
        .map((s) => {
          try {
            return new mongoose.Types.ObjectId(s.orderId);
          } catch {
            return null;
          }
        })
        .filter((id): id is mongoose.Types.ObjectId => id !== null);

      if (orderObjectIds.length > 0) {
        const orders = await Order.find({ _id: { $in: orderObjectIds } })
          .select("orderId")
          .lean();
        const orderMap = new Map(orders.map((o: any) => [o._id.toString(), o.orderId]));

        transformedShipments.forEach((s) => {
          if (s.orderId && !s.orderId.startsWith("ORD-")) {
            const mapped = orderMap.get(s.orderId);
            if (mapped) s.orderId = mapped;
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Shipments retrieved successfully",
      data: transformedShipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Dashboard shipments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve shipments" },
      { status: 500 }
    );
  }
}
