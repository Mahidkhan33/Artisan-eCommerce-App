import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artisan from "@/models/Artisan";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { artisanId, code } = body;

    if (!artisanId || !code) {
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

    if (artisan.isVerified) {
      return NextResponse.json(
        { success: false, message: "Artisan already verified" },
        { status: 400 }
      );
    }

    if (String(artisan.verifyCode) !== String(code)) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (!artisan.verifyCodeExpire || artisan.verifyCodeExpire < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    artisan.isVerified = true;
    artisan.verifyCode = undefined;
    artisan.verifyCodeExpire = undefined;
    await artisan.save();

    return NextResponse.json({
      success: true,
      message: "Artisan account verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Artisan verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify account" },
      { status: 500 }
    );
  }
}
