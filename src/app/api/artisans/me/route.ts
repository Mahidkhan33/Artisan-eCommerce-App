import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan("artisan");
    if (!auth || auth.type !== "artisan") {
      return NextResponse.json(
        { success: false, artisan: null, message: "Artisan not authenticated" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      artisan: auth.data,
    });
  } catch (error: any) {
    console.error("Get artisan profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}
