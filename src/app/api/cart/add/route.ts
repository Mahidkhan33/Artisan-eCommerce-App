import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart, { ICartItem } from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan("user");
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Product ID and Quantity are required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than zero" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isAvailable) {
      return NextResponse.json(
        { success: false, message: "Product is currently not available" },
        { status: 400 }
      );
    }

    if (product.quantity < qty) {
      return NextResponse.json(
        { success: false, message: `Insufficient stock. Only ${product.quantity} available` },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart) {
      cart = new Cart({
        userId: auth.data._id,
        items: [],
      });
    }

    const existingIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );

    if (existingIndex >= 0) {
      const newQuantity = cart.items[existingIndex].quantity + qty;
      if (product.quantity < newQuantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock. Only ${product.quantity} available in total` },
          { status: 400 }
        );
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        name: product.name,
        price: product.price,
        quantity: qty,
        unit: product.unit,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
