"use server";

import { db } from "@/lib/db";
import { wishes, wishlists } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createWish(
  wishlistId: string,
  data: {
    title: string;
    price?: number;
    imageUrl?: string;
    destinationUrl?: string;
    description?: string;
    quantity: number;
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify wishlist belongs to user
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.id, wishlistId), eq(wishlists.userId, session.user.id))
      )
      .then((rows) => rows[0]);

    if (!wishlist) throw new Error("Wishlist not found");

    await db.insert(wishes).values({
      ...data,
      wishlistId,
    });

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create wish" };
  }
}

export async function getWishes(wishlistId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db
    .select()
    .from(wishes)
    .where(eq(wishes.wishlistId, wishlistId));
}

export async function deleteWish(id: string, wishlistId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify wishlist belongs to user
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.id, wishlistId), eq(wishlists.userId, session.user.id))
      )
      .then((rows) => rows[0]);

    if (!wishlist) throw new Error("Wishlist not found");

    await db.delete(wishes).where(eq(wishes.id, id));

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete wish" };
  }
}

export async function updateWishImagePosition(
  id: string,
  wishlistId: string,
  position: {
    vertical: number;
    horizontal: number;
    zoom: number;
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify wishlist belongs to user
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.id, wishlistId), eq(wishlists.userId, session.user.id))
      )
      .then((rows) => rows[0]);

    if (!wishlist) throw new Error("Wishlist not found");

    console.log("Updating wish position:", {
      id,
      wishlistId,
      position,
    });

    await db
      .update(wishes)
      .set({
        verticalPosition: position.vertical,
        horizontalPosition: position.horizontal,
        imageZoom: position.zoom,
      })
      .where(eq(wishes.id, id));

    // Verify the update
    const updatedWish = await db
      .select()
      .from(wishes)
      .where(eq(wishes.id, id))
      .then((rows) => rows[0]);

    console.log("Updated wish:", updatedWish);

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update position:", error);
    return { success: false, error: "Failed to update image position" };
  }
}
