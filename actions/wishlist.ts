"use server";

import { db } from "@/lib/db";
import { wishlists, wishes } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { type Currency } from "@/constants";

export async function getWishlists() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const wishlistsWithWishes = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      category: wishlists.category,
      favorite: wishlists.favorite,
      wishCount: sql<number>`count(${wishes.id})::integer`,
      wishes: sql<{ price: number | null; currency: Currency }[]>`
        json_agg(
          json_build_object(
            'price', ${wishes.price},
            'currency', ${wishes.currency}::text
          )
        ) filter (where ${wishes.id} is not null)
      `,
    })
    .from(wishlists)
    .leftJoin(wishes, eq(wishes.wishlistId, wishlists.id))
    .where(eq(wishlists.userId, session.user.id))
    .groupBy(
      wishlists.id,
      wishlists.title,
      wishlists.category,
      wishlists.favorite
    );

  return wishlistsWithWishes.map((wishlist) => ({
    ...wishlist,
    wishes: (wishlist.wishes || []).map((wish) => ({
      ...wish,
      currency: wish.currency as Currency, // Type assertion since we know the DB only contains valid currencies
    })),
  }));
}

export async function createWishlist(title: string, category: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.insert(wishlists).values({
    title,
    category,
    userId: session.user.id,
  });

  revalidatePath("/wishlists");
}

export async function deleteWishlist(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db
      .delete(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath("/wishlists");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete wishlist" };
  }
}

export async function toggleWishlistFavorite(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
      .then((rows) => rows[0]);

    if (!wishlist) throw new Error("Wishlist not found");

    await db
      .update(wishlists)
      .set({ favorite: !wishlist.favorite })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath("/wishlists");
    revalidatePath("/dashboard");
    return { success: true, isFavorite: !wishlist.favorite };
  } catch (error) {
    return { success: false, error: "Failed to update favorite status" };
  }
}

export async function getFavoriteWishlists() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db
    .select()
    .from(wishlists)
    .where(
      and(eq(wishlists.userId, session.user.id), eq(wishlists.favorite, true))
    );
}

export async function getWishlist(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      category: wishlists.category,
      favorite: wishlists.favorite,
      shared: wishlists.shared,
      shareId: wishlists.shareId,
    })
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
    .then((rows) => rows[0]);
}

export async function toggleWishlistSharing(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const wishlist = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
      .then((rows) => rows[0]);

    if (!wishlist) throw new Error("Wishlist not found");

    const shareId = !wishlist.shared ? crypto.randomUUID() : null;

    await db
      .update(wishlists)
      .set({
        shared: !wishlist.shared,
        shareId: shareId,
      })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath(`/dashboard/wishlists/${id}`);
    if (wishlist.shareId) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

    return { success: true, isShared: !wishlist.shared, shareId };
  } catch (error) {
    return { success: false, error: "Failed to update sharing status" };
  }
}

export async function getSharedWishlist(shareId: string) {
  return await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      category: wishlists.category,
    })
    .from(wishlists)
    .where(and(eq(wishlists.shareId, shareId), eq(wishlists.shared, true)))
    .then((rows) => rows[0]);
}
