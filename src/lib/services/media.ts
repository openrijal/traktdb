import type { Db } from '@/lib/db';
import { mediaItems, seasons, episodes } from 'drizzle/schema';
import { sql, eq } from 'drizzle-orm';
import type { TMDBMediaItem, TMDBSeason, TMDBEpisode } from '@/lib/tmdb';
import { MediaType } from '@/lib/constants';

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
