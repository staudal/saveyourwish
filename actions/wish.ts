"use server";

import { db } from "@/lib/db";
import { wishes, wishlists } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";

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

    // Get the highest position
    const highestPosition = await db
      .select({ position: sql<number>`COALESCE(MAX(position), 0)` })
      .from(wishes)
      .where(eq(wishes.wishlistId, wishlistId))
      .then((rows) => rows[0]?.position ?? 0);

    await db.insert(wishes).values({
      ...data,
      wishlistId,
      position: highestPosition + 1,
    });

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create wish" };
  }
}

export async function getWishes(wishlistId: string, isSharedAccess?: boolean) {
  if (!isSharedAccess) {
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
  }

  return await db
    .select()
    .from(wishes)
    .where(eq(wishes.wishlistId, wishlistId))
    .orderBy(wishes.position);
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

export async function updateWishPosition(
  id: string,
  wishlistId: string,
  direction: "up" | "down"
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get all wishes in the wishlist, ordered by position
    const wishlistWishes = await db
      .select()
      .from(wishes)
      .where(eq(wishes.wishlistId, wishlistId))
      .orderBy(wishes.position);

    const currentIndex = wishlistWishes.findIndex((w) => w.id === id);

    if (direction === "up" && currentIndex === 0) {
      throw new Error("Already at the top");
    }

    if (direction === "down" && currentIndex === wishlistWishes.length - 1) {
      throw new Error("Already at the bottom");
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentWish = wishlistWishes[currentIndex];
    const swapWish = wishlistWishes[swapIndex];

    // Update positions individually
    await db
      .update(wishes)
      .set({ position: swapWish.position })
      .where(eq(wishes.id, currentWish.id));

    await db
      .update(wishes)
      .set({ position: currentWish.position })
      .where(eq(wishes.id, swapWish.id));

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update position:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update wish position",
    };
  }
}

export async function updateWish(
  id: string,
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

    await db.update(wishes).set(data).where(eq(wishes.id, id));

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update wish:", error);
    return { success: false, error: "Failed to update wish" };
  }
}
