ALTER TABLE "conceptProgress" ALTER COLUMN "alfa" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "conceptProgress" ALTER COLUMN "beta" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "conceptProgress" ALTER COLUMN "score" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "conceptProgress" ALTER COLUMN "variance" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "conceptProgressRecord" ADD COLUMN "streak" integer DEFAULT 0 NOT NULL;