import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

export interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

export type Wish = InferSelectModel<typeof wishes> & {
  id: string;
  reservation?: {
    reservedBy: string;
    reservedAt: Date;
  } | null;
};

// Create a subset of Wishlist properties that we actually need
export interface WishlistDisplay {
  id: string;
  title: string;
  shared: boolean;
  shareId: string | null;
}
