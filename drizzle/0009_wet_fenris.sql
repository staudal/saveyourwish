ALTER TABLE "wishlist" ADD COLUMN "shared" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "shareId" text;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_shareId_unique" UNIQUE("shareId");