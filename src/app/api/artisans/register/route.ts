import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artisan from "@/models/Artisan";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      fullName,
      cnic,
      email,
      phoneNumber,
      studioName,
      studioLocation,
      studioDescription,
      accountHolderName,
      bankAccountNumber,
      password,
    } = body;

    if (
      !fullName ||
      !fullName.firstName ||
      !fullName.lastName ||
      !email ||
      !password ||
      !cnic ||
      !phoneNumber ||
      !studioName ||
      !studioLocation ||
      !accountHolderName ||
      !bankAccountNumber
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    let artisan = await Artisan.findOne({ email });

    if (artisan && artisan.isVerified) {
      return NextResponse.json(
        { success: false, message: "Artisan already exists with this email" },
        { status: 400 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 3600000); 

    if (artisan && !artisan.isVerified) {
      
      artisan.verifyCode = verifyCode;
      artisan.verifyCodeExpire = verifyCodeExpire;
      artisan.fullName = fullName;
      artisan.cnic = cnic;
      artisan.phoneNumber = phoneNumber;
      artisan.studioName = studioName;
      artisan.studioLocation = studioLocation;
      artisan.studioDescription = studioDescription;
      artisan.accountHolderName = accountHolderName;
      artisan.bankAccountNumber = bankAccountNumber;
      artisan.password = password; 
      await artisan.save();

      const emailResponse = await sendVerificationEmail(email, fullName.firstName, verifyCode);
      if (!emailResponse.success) {
        return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
      }

      const { password: _, ...artisanResponse } = artisan.toObject();
      return NextResponse.json({
        success: true,
        message: "Verification code resent. Please verify your email.",
        artisan: artisanResponse,
      });
    }

    artisan = new Artisan({
      fullName,
      cnic,
      email,
      phoneNumber,
      studioName,
      studioLocation,
      studioDescription,
      accountHolderName,
      bankAccountNumber,
      password,
      verifyCode,
      verifyCodeExpire,
      isVerified: false,
    });

    await artisan.save();

    const emailResponse = await sendVerificationEmail(email, fullName.firstName, verifyCode);
    if (!emailResponse.success) {
      return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
    }

    const { password: _, ...artisanResponse } = artisan.toObject();
    return NextResponse.json(
      {
        success: true,
        message: "Artisan registered successfully. Please verify your email.",
        artisan: artisanResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Artisan signup error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register artisan" },
      { status: 500 }
    );
  }
}
