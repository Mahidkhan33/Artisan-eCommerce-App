import jwt from "jsonwebtoken";
import User from "@/models/Customer";
import Artisan from "@/models/Artisan";
import connectDB from "./db";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const SECRET: string = process.env.JWT_SECRET;

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedUserOrArtisan(roleType?: "user" | "artisan", cookieHeader?: string) {
  let token = "";
  let artisanToken = "";
  let customerToken = "";
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc: any, c) => {
      const parts = c.split("=");
      if (parts.length >= 2) {
        acc[parts[0].trim()] = parts.slice(1).join("=").trim();
      }
      return acc;
    }, {});
    artisanToken = cookies["artisanToken"] || "";
    customerToken = cookies["customerToken"] || "";
    token = cookies["accessToken"] || "";
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      artisanToken = cookieStore.get("artisanToken")?.value || "";
      customerToken = cookieStore.get("customerToken")?.value || "";
      token = cookieStore.get("accessToken")?.value || "";
    } catch (e) {
      
    }
  }

  // 1. If roleType is "artisan", verify artisanToken or fallback token
  if (roleType === "artisan") {
    const targetToken = artisanToken || token;
    if (!targetToken) return null;
    const decoded = verifyToken(targetToken);
    if (!decoded || !decoded.id) return null;
    if (decoded.role === "artisan" || decoded.role === "admin") {
      await connectDB();
      const artisan = await Artisan.findById(decoded.id).select("-password");
      if (artisan) return { type: "artisan", data: artisan };
    }
    return null;
  }

  // 2. If roleType is "user", verify customerToken or fallback token
  if (roleType === "user") {
    const targetToken = customerToken || token;
    if (!targetToken) return null;
    const decoded = verifyToken(targetToken);
    if (!decoded || !decoded.id) return null;
    if (!decoded.role || decoded.role === "user") {
      await connectDB();
      const user = await User.findById(decoded.id).select("-password");
      if (user) return { type: "user", data: user };
    }
    return null;
  }

  // 3. Fallback if no roleType is specified (check artisan first, then user)
  if (artisanToken) {
    const decoded = verifyToken(artisanToken);
    if (decoded && decoded.id && (decoded.role === "artisan" || decoded.role === "admin")) {
      await connectDB();
      const artisan = await Artisan.findById(decoded.id).select("-password");
      if (artisan) return { type: "artisan", data: artisan };
    }
  }

  if (customerToken) {
    const decoded = verifyToken(customerToken);
    if (decoded && decoded.id && (!decoded.role || decoded.role === "user")) {
      await connectDB();
      const user = await User.findById(decoded.id).select("-password");
      if (user) return { type: "user", data: user };
    }
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      await connectDB();
      if (decoded.role === "artisan" || decoded.role === "admin") {
        const artisan = await Artisan.findById(decoded.id).select("-password");
        if (artisan) return { type: "artisan", data: artisan };
      }
      const user = await User.findById(decoded.id).select("-password");
      if (user) return { type: "user", data: user };
    }
  }

  return null;
}
