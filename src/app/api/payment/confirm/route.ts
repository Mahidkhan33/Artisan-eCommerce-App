import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Stripe from "stripe";
import mongoose from "mongoose";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover" as any,
      typescript: true,
    });
  } catch (error) {
    
  }
}

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
    const { paymentIntentId, shippingAddress } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, message: "Payment Intent ID is required" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const isCashPayment = paymentIntentId.startsWith("cash_") || paymentIntentId === "cash_payment";
    if (!isCashPayment) {
      if (!stripe) {
        return NextResponse.json(
          { success: false, message: "Stripe configuration is missing on the server." },
          { status: 500 }
        );
      }
      try {
        let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === "requires_payment_method" || paymentIntent.status === "requires_confirmation") {
          try {
            paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
              payment_method: "pm_card_visa",
            });
          } catch (e: any) {
            console.error("Auto-confirm failed:", e.message);
          }
        }

        if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
          return NextResponse.json(
            { success: false, message: "Payment was not completed successfully on Stripe." },
            { status: 400 }
          );
        }
        if (paymentIntent.metadata.userId !== auth.data._id.toString()) {
          return NextResponse.json(
            { success: false, message: "Security error: Payment belongs to another user profile." },
            { status: 403 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { success: false, message: `Stripe transaction validation failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    const verifiedItems: any[] = [];
    let totalAmount = 0;
    let artisanId: mongoose.Types.ObjectId | null = null;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product '${item.name}' no longer exists` },
          { status: 404 }
        );
      }
      if (!product.isAvailable) {
        return NextResponse.json(
          { success: false, message: `Product '${item.name}' is no longer available` },
          { status: 400 }
        );
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for '${item.name}'. Only ${product.quantity} available` },
          { status: 400 }
        );
      }

      if (!artisanId && product.artisanId) {
        artisanId = new mongoose.Types.ObjectId(product.artisanId.toString());
      }
      if (artisanId && product.artisanId && product.artisanId.toString() !== artisanId.toString()) {
        return NextResponse.json(
          { success: false, message: "All products in your cart must belong to the same artisan." },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      verifiedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        price: product.price,
        total: itemTotal,
      });
    }

    if (!artisanId) {
      return NextResponse.json(
        { success: false, message: "Product missing artisan assignment details." },
        { status: 400 }
      );
    }

    const order = new Order({
      customerId: auth.data._id,
      items: verifiedItems,
      totalAmount,
      status: isCashPayment ? "pending" : "confirmed",
      shippingAddress,
      paymentMethod: isCashPayment ? "cash" : "card",
      artisanId: artisanId,
    });

    await order.save();

    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
      const updatedProduct = await Product.findById(item.productId);
      if (updatedProduct && updatedProduct.quantity === 0) {
        updatedProduct.isAvailable = false;
        await updatedProduct.save();
      }
    }

    cart.items = [];
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to confirm payment and place order" },
      { status: 500 }
    );
  }
}
