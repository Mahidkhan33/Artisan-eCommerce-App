import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan("user");
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const orders = await Order.find({ customerId: auth.data._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Fetch customer orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
