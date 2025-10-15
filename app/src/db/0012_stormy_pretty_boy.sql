CREATE TABLE "baseAnswer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"answerText" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "baseOption" (
	"id" varchar PRIMARY KEY NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"optionText" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "baseQuestion" (
	"id" varchar PRIMARY KEY NOT NULL,
	"baseQuizId" varchar NOT NULL,
	"questionText" varchar NOT NULL,
	"correctAnswerText" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "baseQuiz" (
	"id" varchar PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "complexQuiz" (
	"id" varchar PRIMARY KEY NOT NULL,
	"baseQuizId" varchar NOT NULL,
	"courseBlockId" varchar NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "complexQuizQuestion" (
	"id" varchar PRIMARY KEY NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"complexQuizId" varchar NOT NULL,
	"conceptId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "complexQuizUser" (
	"id" varchar PRIMARY KEY NOT NULL,
	"complexQuizId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "complexQuizUserAnswer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"complexQuizUserId" varchar NOT NULL,
	"complexQuizQuestionId" varchar NOT NULL,
	"baseAnswerId" varchar NOT NULL,
	"answerText" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "concept" (
	"id" varchar PRIMARY KEY NOT NULL,
	"courseBlockId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"creatorId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "courseBlock" (
	"id" varchar PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "oneTimeQuiz" (
	"id" varchar PRIMARY KEY NOT NULL,
	"creatorId" varchar NOT NULL,
	"baseQuizId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "oneTimeQuizUser" (
	"id" varchar PRIMARY KEY NOT NULL,
	"oneTimeQuizId" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "oneTimeUserAnswer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"oneTimeUserQuizId" varchar NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"baseAnswerId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
DROP TABLE "answer" CASCADE;--> statement-breakpoint
DROP TABLE "option" CASCADE;--> statement-breakpoint
DROP TABLE "question" CASCADE;--> statement-breakpoint
DROP TABLE "quiz" CASCADE;--> statement-breakpoint
DROP TABLE "quizInvitation" CASCADE;--> statement-breakpoint
DROP TABLE "userQuiz" CASCADE;--> statement-breakpoint
ALTER TABLE "baseAnswer" ADD CONSTRAINT "baseAnswer_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseOption" ADD CONSTRAINT "baseOption_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseQuestion" ADD CONSTRAINT "baseQuestion_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuiz" ADD CONSTRAINT "complexQuiz_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuiz" ADD CONSTRAINT "complexQuiz_courseBlockId_courseBlock_id_fk" FOREIGN KEY ("courseBlockId") REFERENCES "public"."courseBlock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizQuestion" ADD CONSTRAINT "complexQuizQuestion_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizQuestion" ADD CONSTRAINT "complexQuizQuestion_complexQuizId_complexQuiz_id_fk" FOREIGN KEY ("complexQuizId") REFERENCES "public"."complexQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizQuestion" ADD CONSTRAINT "complexQuizQuestion_conceptId_concept_id_fk" FOREIGN KEY ("conceptId") REFERENCES "public"."concept"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizUser" ADD CONSTRAINT "complexQuizUser_complexQuizId_complexQuiz_id_fk" FOREIGN KEY ("complexQuizId") REFERENCES "public"."complexQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizUser" ADD CONSTRAINT "complexQuizUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizUserAnswer" ADD CONSTRAINT "complexQuizUserAnswer_complexQuizUserId_complexQuizUser_id_fk" FOREIGN KEY ("complexQuizUserId") REFERENCES "public"."complexQuizUser"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizUserAnswer" ADD CONSTRAINT "complexQuizUserAnswer_complexQuizQuestionId_complexQuizQuestion_id_fk" FOREIGN KEY ("complexQuizQuestionId") REFERENCES "public"."complexQuizQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complexQuizUserAnswer" ADD CONSTRAINT "complexQuizUserAnswer_baseAnswerId_baseAnswer_id_fk" FOREIGN KEY ("baseAnswerId") REFERENCES "public"."baseAnswer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept" ADD CONSTRAINT "concept_courseBlockId_courseBlock_id_fk" FOREIGN KEY ("courseBlockId") REFERENCES "public"."courseBlock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courseBlock" ADD CONSTRAINT "courseBlock_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuiz" ADD CONSTRAINT "oneTimeQuiz_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuiz" ADD CONSTRAINT "oneTimeQuiz_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizUser" ADD CONSTRAINT "oneTimeQuizUser_oneTimeQuizId_oneTimeQuiz_id_fk" FOREIGN KEY ("oneTimeQuizId") REFERENCES "public"."oneTimeQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizUser" ADD CONSTRAINT "oneTimeQuizUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeUserAnswer" ADD CONSTRAINT "oneTimeUserAnswer_oneTimeUserQuizId_oneTimeQuizUser_id_fk" FOREIGN KEY ("oneTimeUserQuizId") REFERENCES "public"."oneTimeQuizUser"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeUserAnswer" ADD CONSTRAINT "oneTimeUserAnswer_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeUserAnswer" ADD CONSTRAINT "oneTimeUserAnswer_baseAnswerId_baseAnswer_id_fk" FOREIGN KEY ("baseAnswerId") REFERENCES "public"."baseAnswer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."questionType";