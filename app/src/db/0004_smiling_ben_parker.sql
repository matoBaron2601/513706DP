ALTER TABLE "quiz" ALTER COLUMN "timePerQuestion" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "timePerQuestion" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "canGoBack" DROP NOT NULL;