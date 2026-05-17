import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    let cart = await Cart.findOne({ userId: auth.data._id });
    
    if (!cart) {
      cart = new Cart({
        userId: auth.data._id,
        items: [],
      });
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load cart" },
      { status: 500 }
    );
  }
}
