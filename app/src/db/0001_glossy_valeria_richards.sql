ALTER TABLE "adaptiveQuiz" DROP CONSTRAINT "adaptiveQuiz_placementQuizId_placementQuiz_id_fk";
--> statement-breakpoint
ALTER TABLE "placementQuiz" ADD COLUMN "baseQuizId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "placementQuiz" ADD CONSTRAINT "placementQuiz_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptiveQuiz" DROP COLUMN "placementQuizId";