CREATE TABLE "podcasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"itunes_id" text NOT NULL,
	"collection_name" text NOT NULL,
	"artist_name" text,
	"artwork_url" text,
	"feed_url" text,
	"genres" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcasts_itunes_id_unique" UNIQUE("itunes_id")
);
--> statement-breakpoint
CREATE TABLE "user_podcast_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"podcast_id" integer NOT NULL,
	"status" text NOT NULL,
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "is_ebook" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_podcast_progress" ADD CONSTRAINT "user_podcast_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_podcast_progress" ADD CONSTRAINT "user_podcast_progress_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_podcast_progress_user_podcast_unique" ON "user_podcast_progress" USING btree ("user_id","podcast_id");