"use server";

import { db } from "@/lib/db";
import { wishes, wishlists, wishReservations } from "@/lib/db";
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

    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

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
    .select({
      id: wishes.id,
      title: wishes.title,
      price: wishes.price,
      currency: wishes.currency,
      imageUrl: wishes.imageUrl,
      destinationUrl: wishes.destinationUrl,
      description: wishes.description,
      quantity: wishes.quantity,
      wishlistId: wishes.wishlistId,
      verticalPosition: wishes.verticalPosition,
      horizontalPosition: wishes.horizontalPosition,
      imageZoom: wishes.imageZoom,
      position: wishes.position,
      reservation: {
        reservedBy: wishReservations.reservedBy,
        reservedAt: wishReservations.reservedAt,
      },
    })
    .from(wishes)
    .leftJoin(wishReservations, eq(wishes.id, wishReservations.wishId))
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

    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

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

    await db
      .update(wishes)
      .set({
        verticalPosition: position.vertical,
        horizontalPosition: position.horizontal,
        imageZoom: position.zoom,
      })
      .where(eq(wishes.id, id));

    await db
      .select()
      .from(wishes)
      .where(eq(wishes.id, id))
      .then((rows) => rows[0]);

    // Revalidate the shared path if the wishlist is shared
    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

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

    // Get the wishlist to check if it's shared
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .then((rows) => rows[0]);

    // Revalidate the shared path if the wishlist is shared
    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

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

    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update wish:", error);
    return { success: false, error: "Failed to update wish" };
  }
}

export async function updateBulkWishPositions(
  wishlistId: string,
  positions: { id: string; position: number }[]
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

    // Update positions one by one
    for (const { id, position } of positions) {
      await db.update(wishes).set({ position }).where(eq(wishes.id, id));
    }

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    if (wishlist.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update positions" };
  }
}

export async function reserveWish(wishId: string, reservedBy: string) {
  try {
    // Get the wish and its associated wishlist
    const wish = await db
      .select({
        id: wishes.id,
        wishlistId: wishes.wishlistId,
        wishlist: {
          id: wishlists.id,
          shared: wishlists.shared,
          shareId: wishlists.shareId,
          userId: wishlists.userId,
        },
      })
      .from(wishes)
      .innerJoin(wishlists, eq(wishes.wishlistId, wishlists.id))
      .where(eq(wishes.id, wishId))
      .then((rows) => rows[0]);

    if (!wish) {
      throw new Error("Wish not found");
    }

    if (!wish.wishlist.shared) {
      throw new Error("Wishlist is not shared");
    }

    // Check if wish is already reserved
    const existingReservation = await db
      .select()
      .from(wishReservations)
      .where(eq(wishReservations.wishId, wishId))
      .then((rows) => rows[0]);

    if (existingReservation) {
      throw new Error("Wish is already reserved");
    }

    // Create the reservation with a generated ID
    await db.insert(wishReservations).values({
      id: crypto.randomUUID(),
      wishId: wish.id,
      reservedBy,
    });

    // Revalidate both the shared and owner views
    revalidatePath(`/shared/${wish.wishlist.shareId}`);
    revalidatePath(`/dashboard/wishlists/${wish.wishlistId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reserve wish:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reserve wish",
    };
  }
}

export async function removeReservation(wishId: string) {
  try {
    // Get the wish and its associated wishlist
    const wish = await db
      .select({
        id: wishes.id,
        wishlistId: wishes.wishlistId,
        wishlist: {
          id: wishlists.id,
          shared: wishlists.shared,
          shareId: wishlists.shareId,
        },
      })
      .from(wishes)
      .innerJoin(wishlists, eq(wishes.wishlistId, wishlists.id))
      .where(eq(wishes.id, wishId))
      .then((rows) => rows[0]);

    if (!wish) {
      throw new Error("Wish not found");
    }

    if (!wish.wishlist.shared) {
      throw new Error("Wishlist is not shared");
    }

    await db
      .delete(wishReservations)
      .where(eq(wishReservations.wishId, wishId));

    // Revalidate both the shared and owner views
    revalidatePath(`/shared/${wish.wishlist.shareId}`);
    revalidatePath(`/dashboard/wishlists/${wish.wishlistId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove reservation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove reservation",
    };
  }
}
