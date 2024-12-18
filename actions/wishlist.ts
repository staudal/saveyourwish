"use server";

import { db } from "@/lib/db";
import { wishlists, wishes } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { type Currency } from "@/constants";
import { deleteImageFromBlob } from "@/lib/blob";

export async function getWishlists() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const wishlistsWithWishes = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      favorite: wishlists.favorite,
      shared: wishlists.shared,
      shareId: wishlists.shareId,
      coverImage: wishlists.coverImage,
      unsplashId: wishlists.unsplashId,
      wishCount: sql<number>`count(${wishes.id})::integer`,
      averagePrice: sql<number>`round(avg(${wishes.price})::numeric, 2)`,
      wishes: sql<
        { price: number | null; currency: Currency; imageUrl: string | null }[]
      >`
        coalesce(
          json_agg(
            json_build_object(
              'price', ${wishes.price},
              'currency', ${wishes.currency}::text,
              'imageUrl', ${wishes.imageUrl}
            )
            ORDER BY ${wishes.position}
          ) filter (where ${wishes.id} is not null),
          '[]'
        )
      `,
    })
    .from(wishlists)
    .leftJoin(wishes, eq(wishes.wishlistId, wishlists.id))
    .where(eq(wishlists.userId, session.user.id))
    .groupBy(wishlists.id);

  return wishlistsWithWishes.map((wishlist) => ({
    ...wishlist,
    wishes: wishlist.wishes.map((wish) => ({
      ...wish,
      currency: wish.currency as Currency,
    })),
  }));
}

export async function createWishlist(data: {
  title: string;
  coverImage: string | null;
  unsplashId: string | null;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await db
      .insert(wishlists)
      .values({
        title: data.title,
        userId: session.user.id,
        coverImage: data.coverImage,
        unsplashId: data.unsplashId,
      })
      .returning({ id: wishlists.id });

    const wishlistId = result[0].id;

    revalidatePath("/wishlists");
    return { success: true, wishlistId };
  } catch (error) {
    return { success: false, error: "Failed to create wishlist" };
  }
}

export async function deleteWishlist(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, response: "Unauthorized" };
  }

  const wishlist = await db
    .select({
      coverImage: wishlists.coverImage,
      title: wishlists.title,
      shared: wishlists.shared,
    })
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (!wishlist) {
    return { success: false, response: "Wishlist not found" };
  }

  if (wishlist.shared) {
    return { success: false, response: "Cannot delete shared wishlists" };
  }

  const deleteResult = await db
    .delete(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

  if (deleteResult.rowCount === 0) {
    return { success: false, response: "Failed to delete wishlist" };
  }

  if (wishlist.coverImage) {
    await deleteImageFromBlob(wishlist.coverImage).catch((error) => {
      console.error("Failed to delete cover image:", error);
    });
  }

  revalidatePath("/wishlists");
  return {
    success: true,
    response: `Wishlist ${wishlist.title} has been deleted`,
  };
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
      coverImage: wishlists.coverImage,
      unsplashId: wishlists.unsplashId,
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

    await db
      .update(wishlists)
      .set({
        shared: !wasShared,
        shareId: !wasShared ? id : null,
      })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath(`/dashboard/wishlists`);
    revalidatePath(`/dashboard/wishlists/${id}`);

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
      coverImage: wishlists.coverImage,
      unsplashId: wishlists.unsplashId,
    })
    .from(wishlists)
    .where(and(eq(wishlists.shareId, shareId), eq(wishlists.shared, true)))
    .then((rows) => rows[0]);
}

export async function updateWishlist(
  id: string,
  data: {
    title: string;
    coverImage: string | null;
    unsplashId: string | null;
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db
      .update(wishlists)
      .set({
        title: data.title,
        coverImage: data.coverImage,
        unsplashId: data.unsplashId,
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

export async function updateWishlistCoverImage(
  id: string,
  coverImage: string,
  unsplashId?: string | null
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get the current wishlist to check for existing cover image
    const currentWishlist = await db
      .select({
        coverImage: wishlists.coverImage,
      })
      .from(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
      .then((rows) => rows[0]);

    // If there's an existing cover image, delete it
    if (currentWishlist?.coverImage) {
      await deleteImageFromBlob(currentWishlist.coverImage);
    }

    // Update with new cover image and unsplashId
    await db
      .update(wishlists)
      .set({
        coverImage,
        unsplashId: unsplashId ?? null,
      })
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

    revalidatePath("/wishlists");
    return { success: true };
  } catch (error) {
    console.error("Failed to update wishlist cover image:", error);
    return { success: false, error: "Failed to update wishlist cover image" };
  }
}

export async function revalidateWishlist(
  id: string,
  wasShared?: boolean,
  shareId?: string | null
) {
  // Use setTimeout to ensure this runs after the UI update
  setTimeout(() => {
    revalidatePath("/dashboard/wishlists");
    revalidatePath(`/dashboard/wishlists/${id}`);
    if (wasShared && shareId) {
      revalidatePath(`/shared/${shareId}`);
    }
  }, 0);
}
