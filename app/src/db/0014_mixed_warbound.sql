ALTER TABLE "conceptProgress" ADD COLUMN "correctA1" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "askedA1" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "correctA2" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "askedA2" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "correctB1" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "askedB1" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "correctB2" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "askedB2" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" ADD COLUMN "mastered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conceptProgress" DROP COLUMN "correct";--> statement-breakpoint
ALTER TABLE "conceptProgress" DROP COLUMN "asked";--> statement-breakpoint
ALTER TABLE "conceptProgress" DROP COLUMN "completed";