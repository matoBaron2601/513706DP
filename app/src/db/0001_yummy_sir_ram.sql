ALTER TABLE "quiz" ALTER COLUMN "timePerQuestion" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "timePerQuestion" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "canGoBack" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "canGoBack" SET NOT NULL;