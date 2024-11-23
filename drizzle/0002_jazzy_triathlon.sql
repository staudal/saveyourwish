CREATE TABLE IF NOT EXISTS "wish" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"price" integer,
	"imageUrl" text,
	"destinationUrl" text,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"wishlistId" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wish" ADD CONSTRAINT "wish_wishlistId_wishlist_id_fk" FOREIGN KEY ("wishlistId") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
