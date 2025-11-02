ALTER TABLE "userBlock" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "block" DROP COLUMN "completed";