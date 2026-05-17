import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Shipment from "@/models/Shipment";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "artisan") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Artisan not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { orderId, expectedDeliveryDate, trackingNumber, carrier } = body;

    if (!orderId || !expectedDeliveryDate) {
      return NextResponse.json(
        { success: false, message: "Order ID and Expected Delivery Date are required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      artisanId: auth.data._id,
    }).populate("customerId");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or does not belong to this artisan" },
        { status: 404 }
      );
    }

    const existingShipment = await Shipment.findOne({
      orderId: new mongoose.Types.ObjectId(orderId),
    });

    if (existingShipment) {
      return NextResponse.json(
        { success: false, message: "Shipment already exists for this order" },
        { status: 400 }
      );
    }

    const customer = order.customerId as any;
    const customerName = customer
      ? `${customer.fullName?.firstName || ""} ${customer.fullName?.lastName || ""}`.trim() || "Unknown Customer"
      : "Unknown Customer";

    let shipmentId: string;
    try {
      const count = await Shipment.countDocuments();
      shipmentId = `SHIP-${String(count + 1).padStart(6, "0")}`;
    } catch {
      shipmentId = `SHIP-${Date.now().toString().slice(-6)}`;
    }

    const shipment = new Shipment({
      shipmentId,
      orderId: new mongoose.Types.ObjectId(orderId),
      customerName,
      customerAddress: order.shippingAddress,
      status: "pending",
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      trackingNumber: trackingNumber || undefined,
      carrier: carrier || undefined,
      artisanId: auth.data._id,
    });

    await shipment.save();

    if (order.status !== "shipped" && order.status !== "delivered") {
      order.status = "shipped";
      await order.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shipment created successfully",
        data: shipment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create shipment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}
