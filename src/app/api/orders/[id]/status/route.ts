import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, artisanId: auth.data._id },
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
