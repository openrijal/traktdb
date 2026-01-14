CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"title" text NOT NULL,
	"authors" text[],
	"description" text,
	"thumbnail" text,
	"published_date" text,
	"page_count" integer,
	"categories" text[],
	"average_rating" integer,
	"ratings_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "user_book_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"book_id" integer NOT NULL,
	"status" text NOT NULL,
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_book_progress" ADD CONSTRAINT "user_book_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_book_progress" ADD CONSTRAINT "user_book_progress_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_book_progress_user_book_unique" ON "user_book_progress" USING btree ("user_id","book_id");