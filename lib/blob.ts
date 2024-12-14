"use server";

import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";

async function compressImage(
  buffer: Buffer,
  maxSize: number = 800
): Promise<Buffer> {
  // Convert buffer to base64
  const base64 = buffer.toString("base64");
  const img = new Image();

  // Create a promise to handle image loading
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = `data:image/jpeg;base64,${base64}`;
  });

  // Calculate new dimensions
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  const newWidth = Math.round(img.width * scale);
  const newHeight = Math.round(img.height * scale);

  // Create canvas and draw image
  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  // Convert to blob with compression
  const blob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.8,
  });

  // Convert blob to buffer
  return Buffer.from(await blob.arrayBuffer());
}

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

    // Process image
    const processedBuffer = await compressImage(buffer);

    const uploadedBlob = await put(
      `users/${session.user.id}/wishlists/${wishlistId}/${uniqueFilename}`,
      processedBuffer,
      {
        access: "public",
        contentType: "image/jpeg",
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
