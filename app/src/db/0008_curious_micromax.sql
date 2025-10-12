ALTER TABLE "userAnswer" DROP CONSTRAINT "userAnswer_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "userAnswer" ADD COLUMN "userQuizId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "userAnswer" ADD CONSTRAINT "userAnswer_userQuizId_user_id_fk" FOREIGN KEY ("userQuizId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userAnswer" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "userAnswer" DROP COLUMN "answeredAt";