"use server";

import sharp from "sharp";

type ProcessImageResult =
  | { success: true; data: string }
  | { success: false; error: string };

export async function processExternalImage(
  imageUrl: string
): Promise<ProcessImageResult> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch external image");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Convert to base64 for frontend use
    const base64Image = `data:image/jpeg;base64,${processedImageBuffer.toString(
      "base64"
    )}`;

    return { success: true, data: base64Image };
  } catch (error) {
    console.error("Error processing image:", error);
    return { success: false, error: "Failed to process image" };
  }
}
