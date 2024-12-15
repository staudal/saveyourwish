import { wishlists, type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

export type Wish = InferSelectModel<typeof wishes> & {
  id: string;
  reservation?: {
    reservedBy: string;
    reservedAt: Date;
  } | null;
};

export type Wishlist = InferSelectModel<typeof wishlists> & {
  wishes: Wish[];
};
