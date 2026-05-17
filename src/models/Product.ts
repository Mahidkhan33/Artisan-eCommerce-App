import mongoose, { Schema, Document } from "mongoose";

export interface IPRODUCT extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  unit: string;
  images: string[];
  artisanId: mongoose.Types.ObjectId;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema: Schema<IPRODUCT> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description must be at most 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      enum: [
        "Vegetables",
        "Fruits",
        "Grains",
        "Dairy",
        "Meat",
        "Poultry",
        "Herbs",
        "Spices",
        "Other",
      ],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Product unit is required"],
      trim: true,
      enum: ["kg", "g", "lb", "piece", "box", "bunch", "dozen", "liter", "ml"],
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one product image is required",
      },
    },
    artisanId: {
      type: Schema.Types.ObjectId,
      ref: "Artisan",
      required: [true, "Artisan ID is required"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ artisanId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });

const Product = mongoose.models.Product || mongoose.model<IPRODUCT>("Product", productSchema);
export default Product;
