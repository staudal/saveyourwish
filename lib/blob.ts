"use server";

import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";

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

    // Convert array back to Uint8Array and then to Blob
    const uint8Array = new Uint8Array(fileData.data);
    const blob = new Blob([uint8Array], { type: fileData.type });

    const uploadedBlob = await put(
      `users/${session.user.id}/wishlists/${wishlistId}/${fileData.name}`,
      blob,
      {
        access: "public",
        addRandomSuffix: true,
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
