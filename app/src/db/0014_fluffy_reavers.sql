ALTER TABLE "complexQuiz" ALTER COLUMN "version" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "concept" ADD COLUMN "learned" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "concept" ADD COLUMN "difficultyIndex" integer DEFAULT 0 NOT NULL;