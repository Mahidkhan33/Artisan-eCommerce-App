import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, user: null, message: "User not authenticated" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      user: auth.data,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load user profile" },
      { status: 500 }
    );
  }
}
