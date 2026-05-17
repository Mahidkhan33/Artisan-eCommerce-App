import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/Customer";
import Cart from "@/models/Cart";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User already verified" },
        { status: 400 }
      );
    }

    if (String(user.verifyCode) !== String(otp)) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (!user.verifyCodeExpire || user.verifyCodeExpire < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpire = undefined;
    await user.save();

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [],
      });
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify account" },
      { status: 500 }
    );
  }
}
