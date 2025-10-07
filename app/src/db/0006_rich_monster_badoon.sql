ALTER TABLE "option" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "userAnswer" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "userQuiz" ADD COLUMN "deletedAt" timestamp;