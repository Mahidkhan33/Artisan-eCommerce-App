import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart, { ICartItem } from "@/models/Cart";
import Product from "@/models/Product";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Quantity is required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than zero. To delete, use the delete action." },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    const existingIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );

    if (existingIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found in cart" },
        { status: 404 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product no longer exists" },
        { status: 404 }
      );
    }

    if (!product.isAvailable) {
      return NextResponse.json(
        { success: false, message: "Product is no longer available" },
        { status: 400 }
      );
    }

    if (product.quantity < qty) {
      return NextResponse.json(
        { success: false, message: `Insufficient stock. Only ${product.quantity} available` },
        { status: 400 }
      );
    }

    cart.items[existingIndex].quantity = qty;
    cart.items[existingIndex].price = product.price;

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error: any) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item: ICartItem) => item.productId.toString() !== productId
    );

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
