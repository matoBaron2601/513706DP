CREATE TABLE "document" (
	"id" varchar PRIMARY KEY NOT NULL,
	"blockId" varchar NOT NULL,
	"filePath" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
DROP TABLE "oneTimeQuiz" CASCADE;--> statement-breakpoint
DROP TABLE "oneTimeQuizAnswer" CASCADE;--> statement-breakpoint
DROP TABLE "oneTimeQuizConcept" CASCADE;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_blockId_block_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."block"("id") ON DELETE no action ON UPDATE no action;