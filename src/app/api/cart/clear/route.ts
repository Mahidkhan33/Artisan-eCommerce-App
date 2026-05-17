import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";

export async function DELETE(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = [];
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error: any) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to clear cart" },
      { status: 500 }
    );
  }
}
