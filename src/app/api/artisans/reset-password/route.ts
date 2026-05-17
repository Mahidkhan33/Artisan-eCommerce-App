import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artisan from "@/models/Artisan";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { artisanId, token, newPassword } = body;

    if (!artisanId || !token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return NextResponse.json(
        { success: false, message: "Artisan not found" },
        { status: 404 }
      );
    }

    if (!artisan.resetPasswordToken || artisan.resetPasswordToken !== token) {
      return NextResponse.json(
        { success: false, message: "Invalid or already used reset token" },
        { status: 400 }
      );
    }

    if (!artisan.resetPasswordExpire || artisan.resetPasswordExpire < new Date()) {
      return NextResponse.json(
        { success: false, message: "Password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    artisan.password = newPassword; 
    artisan.resetPasswordToken = undefined;
    artisan.resetPasswordExpire = undefined;
    await artisan.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Artisan reset password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
