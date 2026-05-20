import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Artisan from "@/models/Artisan";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isAvailable: true,
      quantity: { $gt: 0 },
    })
      .populate({
        path: "artisanId",
        select: "fullName studioName studioLocation studioDescription profileImage isVerified",
      })
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or currently out of stock" },
        { status: 404 }
      );
    }

    if (!product.artisanId || !product.artisanId.isVerified) {
      return NextResponse.json(
        { success: false, message: "Product is currently unavailable" },
        { status: 404 }
      );
    }

    const artisanId = product.artisanId._id.toString();
    const artisan = product.artisanId;

    const sellerName = artisan
      ? `${artisan.fullName?.firstName || ""} ${artisan.fullName?.lastName || ""}`.trim() || artisan.studioName || "Unknown Artisan"
      : "Unknown Artisan";

    const location = artisan?.studioLocation || "Faisalabad, Punjab";

    const artisanImage = artisan?.profileImage || 
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${artisan?.fullName?.firstName || "Artisan"}`;

    const rating = 4.8;

    const transformedProduct = {
      _id: product._id.toString(),
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images || [],
      isAvailable: product.isAvailable,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
      artisanId,
      artisan: {
        _id: artisanId,
        fullName: artisan?.fullName,
        studioName: artisan?.studioName || "Artisan Studio",
        studioLocation: location,
        studioDescription: artisan?.studioDescription || "",
        profileImage: artisanImage,
      },
      sellerName,
      location,
      artisanImage,
      rating,
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error: any) {
    console.error("Public product details error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve product details" },
      { status: 500 }
    );
  }
}
