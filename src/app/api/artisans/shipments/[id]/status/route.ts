import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Shipment from "@/models/Shipment";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedUserOrArtisan("artisan");
    if (!auth || auth.type !== "artisan") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Artisan not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { status, trackingNumber, carrier } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const shipment = await Shipment.findOne({
      _id: new mongoose.Types.ObjectId(id),
      artisanId: auth.data._id,
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, message: "Shipment not found or access denied" },
        { status: 404 }
      );
    }

    shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (carrier) shipment.carrier = carrier;

    if (status === "delivered" && !shipment.actualDeliveryDate) {
      shipment.actualDeliveryDate = new Date();

      await Order.findByIdAndUpdate(shipment.orderId, {
        status: "delivered",
      });
    }

    await shipment.save();

    return NextResponse.json({
      success: true,
      message: `Shipment status updated to ${status} successfully`,
      data: shipment,
    });
  } catch (error: any) {
    console.error("Update shipment status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update shipment status" },
      { status: 500 }
    );
  }
}
