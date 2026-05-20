import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Artisan from "@/models/Artisan";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const query: any = {
      isAvailable: true,
      quantity: { $gt: 0 },
    };

    if (category) {
      query.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = Number(minPrice);
      if (maxPrice !== null) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate({
        path: "artisanId",
        select: "fullName studioName studioLocation profileImage isVerified",
      })
      .sort({ createdAt: -1 })
      .lean();

    const filteredProducts = products.filter((product: any) => {
      return product.artisanId && product.artisanId.isVerified;
    });

    const transformedProducts = filteredProducts.map((product: any) => {
      const artisanId = product.artisanId?._id?.toString() || product.artisanId?.toString() || "";
      const artisan = product.artisanId;
      
      const sellerName = artisan
        ? `${artisan.fullName?.firstName || ""} ${artisan.fullName?.lastName || ""}`.trim() || artisan.studioName || "Unknown Artisan"
        : "Unknown Artisan";

      const location = artisan?.studioLocation || "Faisalabad, Punjab";

      const artisanImage = artisan?.profileImage || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${artisan?.fullName?.firstName || "Artisan"}`;

      const rating = 4.8;

      return {
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
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
          profileImage: artisanImage,
        },
        sellerName,
        location,
        artisanImage,
        rating,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
    });
  } catch (error: any) {
    console.error("Public products fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve products" },
      { status: 500 }
    );
  }
}
