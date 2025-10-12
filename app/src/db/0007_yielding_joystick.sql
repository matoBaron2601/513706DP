CREATE TYPE "public"."questionType" AS ENUM('single-choice', 'multiple-choice');--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "type" "questionType" DEFAULT 'single-choice';