import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artisan from "@/models/Artisan";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const artisan = await Artisan.findOne({ email });
    if (!artisan) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await artisan.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!artisan.isVerified) {
      return NextResponse.json(
        {
          success: false,
          requiresVerification: true,
          artisanId: artisan._id,
          message: "Please verify your email before logging in.",
        },
        { status: 403 }
      );
    }

    const token = signToken({ id: artisan._id, role: "artisan" });

    const cookieStore = await cookies();
    cookieStore.set("artisanToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, 
      path: "/",
    });

    const { password: _, ...artisanResponse } = artisan.toObject();
    return NextResponse.json({
      success: true,
      message: "Login successful",
      artisan: artisanResponse,
    });
  } catch (error: any) {
    console.error("Artisan login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
