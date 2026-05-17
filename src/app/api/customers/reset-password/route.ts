import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/Customer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, token, newPassword } = body;

    if (!userId || !token || !newPassword) {
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

    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return NextResponse.json(
        { success: false, message: "Invalid or already used reset token" },
        { status: 400 }
      );
    }

    if (!user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
      return NextResponse.json(
        { success: false, message: "Password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    user.password = newPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
