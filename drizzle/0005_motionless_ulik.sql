ALTER TABLE "wish" ADD COLUMN "verticalPosition" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "wish" ADD COLUMN "horizontalPosition" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "wish" ADD COLUMN "imageZoom" real DEFAULT 1;--> statement-breakpoint
ALTER TABLE "wish" DROP COLUMN IF EXISTS "imagePosition";