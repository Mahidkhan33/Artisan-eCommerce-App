import { NextResponse } from "next/server";
import { getAuthenticatedUserOrArtisan } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUserOrArtisan();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Access denied" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let base64Image = "";
    let folder = "artisans-app/products";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      const folderParam = formData.get("folder") as string | null;

      if (folderParam === "profile") {
        folder = "artisans-app/profile";
      }

      if (!file) {
        return NextResponse.json(
          { success: false, message: "No image file provided" },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
    } else {
      
      const body = await req.json();
      const { image, folder: folderParam } = body;
      
      if (folderParam === "profile") {
        folder = "artisans-app/profile";
      }

      if (!image) {
        return NextResponse.json(
          { success: false, message: "No image payload provided" },
          { status: 400 }
        );
      }
      base64Image = image;
    }

    const result = await uploadImage(base64Image, folder);

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error: any) {
    console.error("Image upload route error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
