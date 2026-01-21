ALTER TABLE "podcasts" ALTER COLUMN "itunes_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "listen_notes_id" text;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "total_episodes" integer;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "listen_score" integer;--> statement-breakpoint
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_listen_notes_id_unique" UNIQUE("listen_notes_id");