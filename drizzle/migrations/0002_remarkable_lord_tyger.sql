ALTER TABLE "media_items" DROP CONSTRAINT "media_items_tmdb_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "media_items_tmdb_id_type_unique" ON "media_items" USING btree ("tmdb_id","type");