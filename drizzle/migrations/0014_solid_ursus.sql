CREATE TABLE "user_genre_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"genre" text NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_genre_interests_user_genre_unique" ON "user_genre_interests" USING btree ("user_id","genre");
--> statement-breakpoint
ALTER TABLE "user_genre_interests" ADD CONSTRAINT "user_genre_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
