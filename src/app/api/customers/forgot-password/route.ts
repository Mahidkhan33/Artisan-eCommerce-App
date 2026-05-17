import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/Customer";
import { sendResetPasswordEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No user found with this email address" },
        { status: 404 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${resetToken}&userId=${user._id}`;

    const emailResponse = await sendResetPasswordEmail(user.email, user.fullName.firstName, resetUrl);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent successfully. Please check your email.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to initiate password reset" },
      { status: 500 }
    );
  }
}
