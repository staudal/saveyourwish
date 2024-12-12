"use server";

import { db } from "@/lib/db";
import { wishes, wishlists, wishReservations } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { JSDOM, VirtualConsole } from "jsdom";
import {
  titleExtractor,
  priceExtractor,
  currencyExtractor,
  imageExtractor,
} from "@/lib/metadata-extractor";
import { deleteImageFromBlob, uploadImageToBlob } from "@/lib/blob";

const metadataSchema = z.object({
  title: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  destinationUrl: z.string(),
  autoUpdatePrice: z.boolean(),
});

type WishInput = {
  title: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  destinationUrl?: string;
  description?: string;
  quantity?: number;
  autoUpdatePrice?: boolean;
};

export async function createWish(wishlistId: string, data: WishInput) {
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

    // Trust the provided imageUrl - image upload is handled in wish-dialog.tsx
    const wish = await db
      .insert(wishes)
      .values({
        ...data,
        wishlistId,
        position: highestPosition + 1,
      })
      .returning()
      .then((rows) => rows[0]);

    if (wishlist?.shareId && wishlist.shared) {
      revalidatePath(`/shared/${wishlist.shareId}`);
    }

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true, data: wish };
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
      autoUpdatePrice: wishes.autoUpdatePrice,
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

    // Get the wish BEFORE deleting it to get the image URL
    const wish = await db
      .select()
      .from(wishes)
      .where(eq(wishes.id, id))
      .then((rows) => rows[0]);

    if (wish?.imageUrl) {
      await deleteImageFromBlob(wish.imageUrl);
    }

    await db.delete(wishes).where(eq(wishes.id, id));

    revalidatePath(`/dashboard/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWish:", error);
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
  data: WishInput
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get the current wish to check if we need to delete the old image
    const currentWish = await db
      .select()
      .from(wishes)
      .where(eq(wishes.id, id))
      .then((rows) => rows[0]);

    if (currentWish?.imageUrl && currentWish.imageUrl !== data.imageUrl) {
      await deleteImageFromBlob(currentWish.imageUrl);
    }

    await db.update(wishes).set(data).where(eq(wishes.id, id));

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

export async function getUrlMetadata(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL: ${response.statusText}`,
      };
    }

    const html = await response.text();

    // Configure JSDOM to prevent preloading
    const dom = new JSDOM(html, {
      runScripts: "outside-only",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole: new VirtualConsole().sendTo(console, {
        omitJSDOMErrors: true,
      }),
      beforeParse(window) {
        // Prevent preload/prefetch
        const originalCreateElement = window.document.createElement;
        window.document.createElement = function (
          tagName: string,
          options?: ElementCreationOptions
        ) {
          const element = originalCreateElement.call(this, tagName, options);
          if (tagName.toLowerCase() === "link") {
            Object.defineProperty(element, "rel", {
              get: () => null,
              set: () => {},
            });
          }
          return element;
        };
      },
    });

    const document = dom.window.document;

    const rawTitle = titleExtractor.extract(document, url);
    const rawPrice = priceExtractor.extract(document);
    const currency = currencyExtractor.extract(document);
    const images = imageExtractor.extract(document);

    const metadata: Record<string, any> = {
      destinationUrl: url,
      autoUpdatePrice: false,
      images,
      imageUrl: images[0],
    };

    if (rawTitle) {
      metadata.title = titleExtractor.clean?.(rawTitle, url) ?? rawTitle;
    }

    if (rawPrice) {
      const cleanPrice = priceExtractor.clean(rawPrice);
      const numericPrice = parseFloat(cleanPrice);
      if (!isNaN(numericPrice)) {
        metadata.price = numericPrice;
      }
    }

    if (currency) {
      metadata.currency = currency;
    }

    return {
      success: true,
      data: metadataSchema.parse(metadata),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch URL",
    };
  }
}

export async function fetchAndUploadImage(
  imageUrl: string,
  wishlistId: string
) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const buffer = await response.arrayBuffer();
    const file = new File([buffer], "product-image.jpg", {
      type: response.headers.get("content-type") || "image/jpeg",
    });

    const uploadResult = await uploadImageToBlob(
      {
        name: file.name,
        type: file.type,
        data: Array.from(new Uint8Array(buffer)),
      },
      wishlistId
    );

    return uploadResult;
  } catch (error) {
    console.error("Error fetching and uploading image:", error);
    return { success: false as const, error: "Failed to process image" };
  }
}
