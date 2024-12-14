"use server";

export const runtime = "nodejs";

import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import sharp from "sharp";

export async function uploadImageToBlob(
  fileData: {
    name: string;
    type: string;
    data: number[];
  },
  wishlistId: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Convert array back to Buffer
    const buffer = Buffer.from(fileData.data);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = fileData.type.split("/")[1] || "jpg";
    const uniqueFilename = `product-${timestamp}-${randomString}.${extension}`;

    // Process image with sharp
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer();

    const uploadedBlob = await put(
      `users/${session.user.id}/wishlists/${wishlistId}/${uniqueFilename}`,
      processedBuffer,
      {
        access: "public",
        contentType: fileData.type,
      }
    );

    if (!uploadedBlob.url) {
      throw new Error("No URL returned from blob storage");
    }

    return { success: true as const, url: uploadedBlob.url };
  } catch (error) {
    console.error("Error uploading to blob:", error);
    return { success: false as const, error: "Failed to upload image" };
  }
}

export async function deleteImageFromBlob(url: string) {
  try {
    await del(url);
    return { success: true as const };
  } catch (error) {
    console.error("Error deleting from blob:", error);
    return { success: false as const, error: "Failed to delete image" };
  }
}
