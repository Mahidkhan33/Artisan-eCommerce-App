import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthenticatedUserOrArtisan("artisan");
    if (!auth || auth.type !== "artisan") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Artisan not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const product = await Product.findOne({ _id: id, artisanId: auth.data._id });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    product.isAvailable = !product.isAvailable;

    if (product.isAvailable && product.quantity === 0) {
      product.quantity = 10;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Product availability status updated to ${product.isAvailable ? "Available" : "Unavailable"}`,
      data: product,
    });
  } catch (error: any) {
    console.error("Toggle availability error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle availability" },
      { status: 500 }
    );
  }
}
