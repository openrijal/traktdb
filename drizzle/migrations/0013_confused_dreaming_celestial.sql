CREATE TABLE "podcast_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"podcast_id" integer NOT NULL,
	"guid" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pub_date" timestamp,
	"duration" text,
	"audio_url" text,
	"enclosure_length" integer,
	"episode_number" integer,
	"season_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_podcast_episode_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"episode_id" integer NOT NULL,
	"status" text NOT NULL,
	"progress_seconds" integer DEFAULT 0,
	"is_listened" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "last_refreshed_at" timestamp;--> statement-breakpoint
ALTER TABLE "podcast_episodes" ADD CONSTRAINT "podcast_episodes_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_podcast_episode_progress" ADD CONSTRAINT "user_podcast_episode_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_podcast_episode_progress" ADD CONSTRAINT "user_podcast_episode_progress_episode_id_podcast_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."podcast_episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "podcast_episodes_guid_podcast_unique" ON "podcast_episodes" USING btree ("guid","podcast_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_podcast_episode_progress_unique" ON "user_podcast_episode_progress" USING btree ("user_id","episode_id");