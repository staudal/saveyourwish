import { z } from "zod";
import { type Currency } from "@/constants";

export const wishlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  favorite: z.boolean(),
  shared: z.boolean(),
  shareId: z.string().nullable(),
  coverImage: z.string().nullable(),
  unsplashId: z.string().nullable(),
  wishCount: z.number(),
  wishes: z.array(
    z.object({
      price: z.number().nullable(),
      currency: z.string() as z.ZodType<Currency>,
      imageUrl: z.string().nullable(),
    })
  ),
  unsplashUsername: z.string().nullable(),
});

export type Wishlist = z.infer<typeof wishlistSchema>;
