CREATE TABLE "answer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userQuizId" varchar NOT NULL,
	"questionId" varchar NOT NULL,
	"optionId" varchar NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
DROP TABLE "userAnswer" CASCADE;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_userQuizId_user_id_fk" FOREIGN KEY ("userQuizId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionId_question_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_optionId_option_id_fk" FOREIGN KEY ("optionId") REFERENCES "public"."option"("id") ON DELETE no action ON UPDATE no action;