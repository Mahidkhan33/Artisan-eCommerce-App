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

export async function getAuthenticatedUserOrArtisan(cookieHeader?: string) {
  let token = "";
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc: any, c) => {
      const parts = c.split("=");
      if (parts.length >= 2) {
        acc[parts[0].trim()] = parts.slice(1).join("=").trim();
      }
      return acc;
    }, {});
    token = cookies["accessToken"] || "";
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value || "";
    } catch (e) {
      
    }
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  await connectDB();

  if (decoded.role === "artisan" || decoded.role === "admin") {
    const artisan = await Artisan.findById(decoded.id).select("-password");
    if (artisan) {
      return { type: "artisan", data: artisan };
    }
  }

  const user = await User.findById(decoded.id).select("-password");
  if (user) {
    return { type: "user", data: user };
  }

  if (!decoded.role) {
    const artisan = await Artisan.findById(decoded.id).select("-password");
    if (artisan) return { type: "artisan", data: artisan };
    const user = await User.findById(decoded.id).select("-password");
    if (user) return { type: "user", data: user };
  }

  return null;
}
