CREATE TABLE "adaptiveQuiz" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userBlockId" varchar NOT NULL,
	"baseQuizId" varchar NOT NULL,
	"placementQuizId" varchar NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "adaptiveQuizAnswer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"adaptiveQuizId" varchar NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"answerText" varchar NOT NULL,
	"isCorrect" boolean NOT NULL,
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
CREATE TABLE "block" (
	"id" varchar PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"file" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "completedConcept" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userBlockId" varchar NOT NULL,
	"conceptId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "concept" (
	"id" varchar PRIMARY KEY NOT NULL,
	"blockId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"difficultyIndex" integer NOT NULL,
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
CREATE TABLE "oneTimeQuizAnswer" (
	"id" varchar PRIMARY KEY NOT NULL,
	"oneTimeQuizId" varchar NOT NULL,
	"baseQuestionId" varchar NOT NULL,
	"answerText" varchar NOT NULL,
	"isCorrect" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "oneTimeQuizConcept" (
	"id" varchar PRIMARY KEY NOT NULL,
	"oneTimeQuizId" varchar NOT NULL,
	"conceptId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "placementQuiz" (
	"id" varchar PRIMARY KEY NOT NULL,
	"blockId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"profilePicture" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "userBlock" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"blockId" varchar NOT NULL,
	"placementQuizId" varchar NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adaptiveQuiz" ADD CONSTRAINT "adaptiveQuiz_userBlockId_userBlock_id_fk" FOREIGN KEY ("userBlockId") REFERENCES "public"."userBlock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptiveQuiz" ADD CONSTRAINT "adaptiveQuiz_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptiveQuiz" ADD CONSTRAINT "adaptiveQuiz_placementQuizId_placementQuiz_id_fk" FOREIGN KEY ("placementQuizId") REFERENCES "public"."placementQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptiveQuizAnswer" ADD CONSTRAINT "adaptiveQuizAnswer_adaptiveQuizId_adaptiveQuiz_id_fk" FOREIGN KEY ("adaptiveQuizId") REFERENCES "public"."adaptiveQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adaptiveQuizAnswer" ADD CONSTRAINT "adaptiveQuizAnswer_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseOption" ADD CONSTRAINT "baseOption_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseQuestion" ADD CONSTRAINT "baseQuestion_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completedConcept" ADD CONSTRAINT "completedConcept_userBlockId_userBlock_id_fk" FOREIGN KEY ("userBlockId") REFERENCES "public"."userBlock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completedConcept" ADD CONSTRAINT "completedConcept_conceptId_concept_id_fk" FOREIGN KEY ("conceptId") REFERENCES "public"."concept"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept" ADD CONSTRAINT "concept_blockId_block_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuiz" ADD CONSTRAINT "oneTimeQuiz_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuiz" ADD CONSTRAINT "oneTimeQuiz_baseQuizId_baseQuiz_id_fk" FOREIGN KEY ("baseQuizId") REFERENCES "public"."baseQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizAnswer" ADD CONSTRAINT "oneTimeQuizAnswer_oneTimeQuizId_oneTimeQuiz_id_fk" FOREIGN KEY ("oneTimeQuizId") REFERENCES "public"."oneTimeQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizAnswer" ADD CONSTRAINT "oneTimeQuizAnswer_baseQuestionId_baseQuestion_id_fk" FOREIGN KEY ("baseQuestionId") REFERENCES "public"."baseQuestion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizConcept" ADD CONSTRAINT "oneTimeQuizConcept_oneTimeQuizId_oneTimeQuiz_id_fk" FOREIGN KEY ("oneTimeQuizId") REFERENCES "public"."oneTimeQuiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oneTimeQuizConcept" ADD CONSTRAINT "oneTimeQuizConcept_conceptId_concept_id_fk" FOREIGN KEY ("conceptId") REFERENCES "public"."concept"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placementQuiz" ADD CONSTRAINT "placementQuiz_blockId_block_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBlock" ADD CONSTRAINT "userBlock_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBlock" ADD CONSTRAINT "userBlock_blockId_block_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBlock" ADD CONSTRAINT "userBlock_placementQuizId_placementQuiz_id_fk" FOREIGN KEY ("placementQuizId") REFERENCES "public"."placementQuiz"("id") ON DELETE no action ON UPDATE no action;