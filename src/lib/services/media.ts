import type { Db } from '@/lib/db';
import { mediaItems, seasons, episodes } from 'drizzle/schema';
import { sql, eq } from 'drizzle-orm';
import type { TMDBMediaItem, TMDBSeason, TMDBEpisode } from '@/lib/tmdb';
import { createTmdb } from '@/lib/tmdb';
import { MediaType } from '@/lib/constants';
import { episodeProgress } from 'drizzle/schema';

/**
 * Upserts a single media item into the database.
 * Returns the internal ID of the media item.
 */
export async function upsertMediaItem(db: Db, item: TMDBMediaItem, type: MediaType): Promise<number | undefined> {
    const values = {
        tmdbId: item.id,
        type: type,
        title: item.title || item.name || 'Unknown',
        originalTitle: item.original_title || item.original_name,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        releaseDate: item.release_date || item.first_air_date || null,
        lastAirDate: item.last_air_date || null,
        status: item.status,
        voteAverage: item.vote_average ? Math.round(item.vote_average * 10) : null,
        voteCount: item.vote_count,
    };

    const insertedIds = await db.insert(mediaItems)
        .values(values)
        .onConflictDoUpdate({
            target: [mediaItems.tmdbId, mediaItems.type],
            set: {
                title: sql.raw(`excluded.title`),
                overview: sql.raw(`excluded.overview`),
                posterPath: sql.raw(`excluded.poster_path`),
                backdropPath: sql.raw(`excluded.backdrop_path`),
                lastAirDate: sql.raw(`excluded.last_air_date`),
                status: sql.raw(`excluded.status`),
                voteAverage: sql.raw(`excluded.vote_average`),
                voteCount: sql.raw(`excluded.vote_count`),
                updatedAt: new Date(),
            }
        })
        .returning({ id: mediaItems.id });

    return insertedIds[0]?.id;
}

/**
 * Upserts a list of seasons for a media item.
 */
export async function upsertSeasons(db: Db, seasonData: TMDBSeason[], mediaItemId: number) {
    if (seasonData.length === 0) return;

    const values = seasonData.map(s => ({
        tmdbId: s.id,
        mediaItemId: mediaItemId,
        seasonNumber: s.season_number,
        name: s.name,
        overview: s.overview,
        posterPath: s.poster_path,
        airDate: s.air_date || null,
        episodeCount: s.episode_count,
        voteAverage: s.vote_average ? Math.round(s.vote_average * 10) : 0,
    }));

    await db.insert(seasons)
        .values(values)
        .onConflictDoUpdate({
            target: [seasons.tmdbId],
            set: {
                name: sql.raw(`excluded.name`),
                overview: sql.raw(`excluded.overview`),
                posterPath: sql.raw(`excluded.poster_path`),
                episodeCount: sql.raw(`excluded.episode_count`),
                voteAverage: sql.raw(`excluded.vote_average`),
                updatedAt: new Date(),
            }
        });
}

/**
 * Upserts a single season into the database.
 * Returns the internal ID of the season.
 */
export async function upsertSeason(db: Db, season: TMDBSeason, mediaItemId: number): Promise<number | undefined> {
    const values = {
        tmdbId: season.id,
        mediaItemId: mediaItemId,
        seasonNumber: season.season_number,
        name: season.name,
        overview: season.overview,
        posterPath: season.poster_path,
        airDate: season.air_date || null,
        episodeCount: season.episode_count,
        voteAverage: season.vote_average ? Math.round(season.vote_average * 10) : 0,
    };

    const insertedIds = await db.insert(seasons)
        .values(values)
        .onConflictDoUpdate({
            target: [seasons.tmdbId],
            set: {
                name: sql.raw(`excluded.name`),
                overview: sql.raw(`excluded.overview`),
                posterPath: sql.raw(`excluded.poster_path`),
                episodeCount: sql.raw(`excluded.episode_count`),
                voteAverage: sql.raw(`excluded.vote_average`),
                updatedAt: new Date(),
            }
        })
        .returning({ id: seasons.id });

    return insertedIds[0]?.id;
}

/**
 * Upserts a list of episodes for a season.
 * Returns the internal IDs of the episodes.
 */
export async function upsertEpisodes(db: Db, episodeData: TMDBEpisode[], seasonId: number): Promise<void> {
    if (episodeData.length === 0) return;

    const values = episodeData.map(e => ({
        tmdbId: e.id,
        seasonId: seasonId,
        episodeNumber: e.episode_number,
        name: e.name,
        overview: e.overview,
        stillPath: e.still_path,
        airDate: e.air_date || null,
        voteAverage: e.vote_average ? Math.round(e.vote_average * 10) : 0,
        voteCount: e.vote_count,
    }));

    await db.insert(episodes)
        .values(values)
        .onConflictDoUpdate({
            target: [episodes.tmdbId],
            set: {
                name: sql.raw(`excluded.name`),
                overview: sql.raw(`excluded.overview`),
                stillPath: sql.raw(`excluded.still_path`),
                airDate: sql.raw(`excluded.air_date`),
                voteAverage: sql.raw(`excluded.vote_average`),
                voteCount: sql.raw(`excluded.vote_count`),
                updatedAt: new Date(),
            }
        });
}

/**
 * Bulk updates the watch status of all episodes for a given media item (TV Show).
 * If episodes are missing from the DB, it fetches them from TMDB.
 */
export async function bulkUpdateEpisodeStatus(db: Db, userId: string, mediaItemId: number, watched: boolean, env?: any) {
    // 1. Get all seasons for this media item
    const seasonsList = await db.select({
        id: seasons.id,
        tmdbId: seasons.tmdbId,
        seasonNumber: seasons.seasonNumber,
        episodeCount: seasons.episodeCount
    })
        .from(seasons)
        .where(eq(seasons.mediaItemId, mediaItemId));

    if (seasonsList.length === 0) return;

    // Check if we have episodes for these seasons
    const seasonIds = seasonsList.map(s => s.id);

    let allEpisodes = await db.select({ id: episodes.id, seasonId: episodes.seasonId })
        .from(episodes)
        .where(sql`${episodes.seasonId} IN ${seasonIds}`);

    // If we have significantly fewer episodes than expected (heuristic), fetch from TMDB
    // Or if we have 0 episodes but seasons exist.
    const totalExpectedEpisodes = seasonsList.reduce((acc, s) => acc + (s.episodeCount || 0), 0);
    const hasMissingEpisodes = allEpisodes.length < totalExpectedEpisodes && allEpisodes.length === 0; // Only safe to auto-fetch if we have ZERO, otherwise we might duplicate or be slow. Let's start with ZERO check.

    if (hasMissingEpisodes && env) {
        const tmdb = createTmdb(env);
        // We need the TV Show TMDB ID.
        const show = await db.select({ tmdbId: mediaItems.tmdbId }).from(mediaItems).where(eq(mediaItems.id, mediaItemId)).limit(1);

        if (show.length > 0) {
            const tvId = show[0].tmdbId;
            // Fetch episodes for each season
            // This is heavy, but necessary for "Mark All Watched" on a fresh show.
            // Limit concurrency?
            for (const season of seasonsList) {
                if (season.seasonNumber === 0) continue; // Skip specials for now? Or include them? User usually wants main seasons.
                try {
                    const seasonData = await tmdb.getSeason(tvId, season.seasonNumber);
                    if (seasonData.episodes) {
                        await upsertEpisodes(db, seasonData.episodes, season.id);
                    }
                } catch (e) {
                    console.error(`Failed to fetch season ${season.seasonNumber} for TV ${tvId}`, e);
                }
            }

            // Re-fetch episode IDs
            allEpisodes = await db.select({ id: episodes.id, seasonId: episodes.seasonId })
                .from(episodes)
                .where(sql`${episodes.seasonId} IN ${seasonIds}`);
        }
    }

    const episodeIds = allEpisodes.map(e => e.id);

    if (episodeIds.length === 0) return;

    // 3. Keep it simple: loop and upsert (or use ON CONFLICT DO UPDATE on a bulk insert)
    const values = episodeIds.map(eid => ({
        userId,
        episodeId: eid,
        watched,
    }));

    // Split into chunks if too many? For a single show (e.g. 1000 episodes for One Piece), might be large but usually manageable in one tx usually. 
    // PG max params is 65535. 3 params per row = ~21k rows. One Piece is 1100 eps. Safe.

    await db.insert(episodeProgress)
        .values(values)
        .onConflictDoUpdate({
            target: [episodeProgress.userId, episodeProgress.episodeId],
            set: { watched, updatedAt: new Date() }
        });
}
