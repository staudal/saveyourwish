ALTER TABLE "wish" ADD COLUMN "price_update_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wish" ADD COLUMN "last_price_update_attempt" timestamp;