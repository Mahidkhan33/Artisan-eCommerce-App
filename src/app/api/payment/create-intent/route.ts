import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
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
    console.warn("⚠️ Failed to initialize Stripe. Card payments will not be active:", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth || auth.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Customer not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { shippingAddress, paymentMethod } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: auth.data._id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 }
      );
    }

    let totalAmount = 0;
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
      totalAmount += product.price * item.quantity;
    }

    if (paymentMethod === "cash") {
      return NextResponse.json({
        success: true,
        clientSecret: "cash_payment",
        paymentIntentId: `cash_${Date.now()}_${auth.data._id}`,
      });
    }

    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Card payments are currently offline. Please select Cash on Delivery or contact admin.",
        },
        { status: 400 }
      );
    }

    const PKR_TO_USD_RATE = 280;
    const amountInUSD = totalAmount / PKR_TO_USD_RATE;
    const amountInCents = Math.round(amountInUSD * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        {
          success: false,
          message: `Stripe requires minimum USD amount. Your order must be at least Rs. ${Math.ceil(
            (50 * PKR_TO_USD_RATE) / 100
          )}`,
        },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        userId: auth.data._id.toString(),
        orderType: "cart",
        originalAmountPKR: totalAmount.toString(),
        conversionRate: PKR_TO_USD_RATE.toString(),
      },
      description: `ArtisanAlley Order - Rs. ${totalAmount.toFixed(2)} PKR`,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret || "",
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
