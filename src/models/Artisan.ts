import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IARTISAN extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: {
    firstName: string;
    lastName: string;
  };
  cnic: string;
  email: string;
  phoneNumber: string;
  studioName: string;
  studioLocation: string;
  studioDescription: string;
  accountHolderName: string;
  bankAccountNumber: string;
  password: string;
  isVerified: boolean;
  refreshToken?: string;
  verifyCode?: string;
  verifyCodeExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const artisanSchema: Schema<IARTISAN> = new Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [40, "First name must be at most 40 characters"],
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [40, "Last name must be at most 40 characters"],
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      unique: true,
      trim: true,
      minLength: [13, "CNIC must be at least 13 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10,15}$/g, "Enter valid phone number"],
    },
    studioName: {
      type: String,
      required: [true, "Studio name is required"],
      trim: true,
      minlength: [2, "Studio name must be at least 2 characters"],
    },
    studioLocation: {
      type: String,
      required: [true, "Studio location is required"],
      trim: true,
      minlength: [2, "Studio location must be at least 2 characters"],
    },
    studioDescription: {
      type: String,
      required: [true, "Studio description is required"],
      trim: true,
      minlength: [2, "Studio description must be at least 2 characters"],
    },
    accountHolderName: {
      type: String,
      required: [true, "Account holder name is required"],
      trim: true,
      minlength: [2, "Account holder name must be at least 2 characters"],
    },
    bankAccountNumber: {
      type: String,
      required: [true, "Bank account number is required"],
      trim: true,
      minlength: [2, "Bank account number must be at least 2 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    verifyCode: {
      type: String,
      default: null,
    },
    verifyCodeExpire: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

artisanSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

artisanSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const Artisan = mongoose.models.Artisan || mongoose.model<IARTISAN>("Artisan", artisanSchema);
export default Artisan;
