import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");

    return NextResponse.json({
      success: true,
      message: "Artisan logged out successfully",
    });
  } catch (error: any) {
    console.error("Artisan logout error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log out" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
