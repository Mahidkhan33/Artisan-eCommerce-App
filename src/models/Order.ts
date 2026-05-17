import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "cash";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface IShippingAddress {
  streetAddress: string;
  houseNo: string;
  town: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface IORDER extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  artisanId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    streetAddress: { type: String, required: true, trim: true },
    houseNo: { type: String, required: true, trim: true },
    town: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema: Schema<IORDER> = new Schema(
  {
    orderId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalAmount: { type: Number, required: true, min: [0, "Total amount cannot be negative"] },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      required: true,
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["card", "cash"], required: true },
    artisanId: { type: Schema.Types.ObjectId, ref: "Artisan", required: false },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ artisanId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model<IORDER>("Order", orderSchema);

orderSchema.pre("save", async function (next: any) {
  if (this.isNew) {
    if (!this.orderId || this.orderId.startsWith("TEMP-")) {
      try {
        const count = await Order.countDocuments();
        this.orderId = `ORD-${String(count + 1).padStart(6, "0")}`;
      } catch (error) {
        this.orderId = `ORD-${Date.now().toString().slice(-6)}`;
      }
    }
  }
  next();
});

export default Order;
