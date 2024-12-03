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
      favorite: wishlists.favorite,
      wishCount: sql<number>`count(${wishes.id})::integer`,
      wishes: sql<
        { price: number | null; currency: Currency; imageUrl: string | null }[]
      >`
        json_agg(
          json_build_object(
            'price', ${wishes.price},
            'currency', ${wishes.currency}::text,
            'imageUrl', ${wishes.imageUrl}
          )
          ORDER BY ${wishes.position}
        ) filter (where ${wishes.id} is not null)
      `,
    })
    .from(wishlists)
    .leftJoin(wishes, eq(wishes.wishlistId, wishlists.id))
    .where(eq(wishlists.userId, session.user.id))
    .groupBy(wishlists.id, wishlists.title, wishlists.favorite);

  return wishlistsWithWishes.map((wishlist) => ({
    ...wishlist,
    wishes: (wishlist.wishes || []).map((wish) => ({
      ...wish,
      currency: wish.currency as Currency,
    })),
  }));
}

export async function createWishlist(title: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.insert(wishlists).values({
      title,
      userId: session.user.id,
    });

    revalidatePath("/wishlists");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create wishlist" };
  }
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

export async function getWishlist(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
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

    const wasShared = wishlist.shared;
    const oldShareId = wishlist.shareId;

    await db
      .update(wishlists)
      .set({
        shared: !wasShared,
        shareId: !wasShared ? id : null,
      })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    // Always revalidate the dashboard path
    revalidatePath(`/dashboard/wishlists/${id}`);

    // If we're disabling sharing, revalidate the old share URL
    if (wasShared && oldShareId) {
      revalidatePath(`/shared/${oldShareId}`);
    }
    // If we're enabling sharing, revalidate the new share URL
    if (!wasShared) {
      revalidatePath(`/shared/${id}`);
    }

    return {
      success: true,
      isShared: !wasShared,
      shareId: !wasShared ? id : null,
    };
  } catch (error) {
    return { success: false, error: "Failed to update sharing status" };
  }
}

export async function getSharedWishlist(shareId: string) {
  return await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      shared: wishlists.shared,
      shareId: wishlists.shareId,
      userId: wishlists.userId,
    })
    .from(wishlists)
    .where(and(eq(wishlists.shareId, shareId), eq(wishlists.shared, true)))
    .then((rows) => rows[0]);
}

export async function updateWishlist(id: string, data: { title: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db
      .update(wishlists)
      .set({
        title: data.title,
      })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath(`/dashboard/wishlists`);
    revalidatePath(`/dashboard/wishlists/${id}`);

    // Get the wishlist to check if it's shared
    const wishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id))
      .then((rows) => rows[0]);

    // Revalidate the shared path if the wishlist is shared
    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update wishlist" };
  }
}
