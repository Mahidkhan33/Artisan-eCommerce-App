import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/Customer";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, email, phoneNumber, password } = body;

    if (!fullName || !fullName.firstName || !fullName.lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 3600000); 

    if (user && !user.isVerified) {
      
      user.verifyCode = verifyCode;
      user.verifyCodeExpire = verifyCodeExpire;
      user.fullName = fullName;
      user.phoneNumber = phoneNumber;
      user.password = password; 
      await user.save();

      const emailResponse = await sendVerificationEmail(email, fullName.firstName, verifyCode);
      if (!emailResponse.success) {
        return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
      }

      const { password: _, ...userResponse } = user.toObject();
      return NextResponse.json({
        success: true,
        message: "Verification code resent. Please verify your email.",
        user: userResponse,
      });
    }

    user = new User({
      fullName,
      email,
      phoneNumber,
      password,
      verifyCode,
      verifyCodeExpire,
      isVerified: false,
    });

    await user.save();

    const emailResponse = await sendVerificationEmail(email, fullName.firstName, verifyCode);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    const { password: _, ...userResponse } = user.toObject();
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
