CREATE UNIQUE INDEX "episodes_tmdb_id_unique" ON "episodes" USING btree ("tmdb_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_tmdb_id_unique" ON "seasons" USING btree ("tmdb_id");