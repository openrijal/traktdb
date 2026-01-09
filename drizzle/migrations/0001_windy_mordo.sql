CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tmdb_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"name" text NOT NULL,
	"overview" text,
	"still_path" text,
	"air_date" date,
	"vote_average" integer,
	"vote_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"tmdb_id" integer NOT NULL,
	"media_item_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"name" text NOT NULL,
	"overview" text,
	"poster_path" text,
	"air_date" date,
	"episode_count" integer,
	"vote_average" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "original_title" text;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "vote_average" integer;--> statement-breakpoint
ALTER TABLE "media_items" ADD COLUMN "vote_count" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_tmdb_id_unique" UNIQUE("tmdb_id");