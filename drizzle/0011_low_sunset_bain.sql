CREATE TABLE IF NOT EXISTS "wish_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"wish_id" text NOT NULL,
	"reserved_by" text NOT NULL,
	"reserved_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wish_reservations" ADD CONSTRAINT "wish_reservations_wish_id_wish_id_fk" FOREIGN KEY ("wish_id") REFERENCES "public"."wish"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
