CREATE TABLE "quizInvitation" (
	"id" varchar PRIMARY KEY NOT NULL,
	"quizId" varchar NOT NULL,
	"maxUses" integer DEFAULT 0 NOT NULL,
	"currentUses" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "answer" DROP CONSTRAINT "answer_userQuizId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "question" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "userQuiz" ALTER COLUMN "openedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "userQuiz" ALTER COLUMN "openedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "answer" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "option" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "userQuiz" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "quizInvitation" ADD CONSTRAINT "quizInvitation_quizId_quiz_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_userQuizId_userQuiz_id_fk" FOREIGN KEY ("userQuizId") REFERENCES "public"."userQuiz"("id") ON DELETE no action ON UPDATE no action;