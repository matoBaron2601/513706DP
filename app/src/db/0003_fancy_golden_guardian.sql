ALTER TABLE "userBlock" DROP CONSTRAINT "userBlock_placementQuizId_placementQuiz_id_fk";
--> statement-breakpoint
ALTER TABLE "userBlock" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "userBlock" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "userBlock" DROP COLUMN "placementQuizId";--> statement-breakpoint
ALTER TABLE "userBlock" DROP COLUMN "completed";