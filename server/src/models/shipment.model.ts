import mongoose, { Schema, Document } from "mongoose";
export type ShipmentStatus = "pending" | "preparing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
export interface ICustomerAddress {
  streetAddress: string;
  houseNo: string;
  town: string;
  city: string;
  country: string;
  postalCode: string;
}
export interface ISHIPMENT extends Document {
  _id: mongoose.Types.ObjectId;
  shipmentId: string;
  orderId: mongoose.Types.ObjectId;
  customerName: string;
  customerAddress: ICustomerAddress;
  status: ShipmentStatus;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  farmerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
const customerAddressSchema = new Schema<ICustomerAddress>({
  streetAddress: {
    type: String,
    required: true,
    trim: true,
  },
  houseNo: {
    type: String,
    required: true,
    trim: true,
  },
  town: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });
const shipmentSchema: Schema<ISHIPMENT> = new Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerAddress: {
      type: customerAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "in_transit", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: null,
    },
    carrier: {
      type: String,
      trim: true,
      default: null,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
  },
  { timestamps: true }
);
shipmentSchema.index({ farmerId: 1 });
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ expectedDeliveryDate: 1 });
const Shipment = mongoose.model<ISHIPMENT>("Shipment", shipmentSchema);
shipmentSchema.pre("save", async function (next) {
  if (this.isNew && !this.shipmentId) {
    try {
      const count = await Shipment.countDocuments();
      this.shipmentId = `SHIP-${String(count + 1).padStart(6, "0")}`;
    } catch (error) {
      this.shipmentId = `SHIP-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});
shipmentSchema.pre("save", function (next) {
  if (this.status === "delivered" && !this.actualDeliveryDate) {
    this.actualDeliveryDate = new Date();
  }
  next();
});
export default Shipment;
