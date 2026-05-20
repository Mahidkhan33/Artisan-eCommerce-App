import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("customerToken");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log out" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
