import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

const mockImages = [
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600", 
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600", 
];

export const uploadImage = async (
  filePath: string,
  folder: string = "artisans-app/products"
): Promise<UploadResult> => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.log("[LOCAL DEV MODE] Mocking Cloudinary upload for image.");
    
    const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
    return {
      url: randomUrl,
      secure_url: randomUrl,
      public_id: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit", quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message || error}`);
  }
};

export const uploadMultipleImages = async (
  files: string[],
  folder: string = "artisans-app/products"
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error: any) {
    console.error("Cloudinary multiple upload error:", error);
    throw new Error(`Failed to upload images: ${error.message || error}`);
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (publicId.startsWith("mock-")) {
    console.log(`[LOCAL DEV MODE] Mocking Cloudinary delete for publicId: ${publicId}`);
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete image: ${error.message || error}`);
  }
};

export const deleteMultipleImages = async (publicIds: string[]): Promise<void> => {
  try {
    const nonMockIds = publicIds.filter((id) => !id.startsWith("mock-"));
    if (nonMockIds.length > 0) {
      await cloudinary.api.delete_resources(nonMockIds);
    }
  } catch (error: any) {
    console.error("Cloudinary multiple delete error:", error);
    throw new Error(`Failed to delete images: ${error.message || error}`);
  }
};

export default cloudinary;
