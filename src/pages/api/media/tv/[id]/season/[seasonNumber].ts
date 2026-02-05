import type { APIRoute } from 'astro';
import { createTmdb } from '@/lib/tmdb';
import { createDb } from '@/lib/db';
import { seasons, episodes, episodeProgress, mediaItems } from 'drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { upsertMediaItem, upsertSeason, upsertEpisodes } from '@/lib/services/media';
import { MediaType } from '@/lib/constants';
import { createAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ params, locals, request }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const tmdb = createTmdb(env);
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const tvId = parseInt(params.id!);
    const seasonNumber = parseInt(params.seasonNumber!);

    if (isNaN(tvId) || isNaN(seasonNumber)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
    }

    try {
        // Try to fetch from local database first
        const cachedSeason = await db.select({
            tmdbId: seasons.tmdbId,
            name: seasons.name,
            overview: seasons.overview,
            posterPath: seasons.posterPath,
            airDate: seasons.airDate,
            episodeCount: seasons.episodeCount,
            voteAverage: seasons.voteAverage,
            seasonNumber: seasons.seasonNumber,
        })
            .from(seasons)
            .where(eq(seasons.tmdbId, tvId))
            .limit(1);

        let episodeData: any[] = [];

        // Fetch episodes from local DB
        if (cachedSeason.length > 0) {
            const dbEpisodes = await db.select({
                id: episodes.id,
                episodeNumber: episodes.episodeNumber,
                name: episodes.name,
                overview: episodes.overview,
                stillPath: episodes.stillPath,
                airDate: episodes.airDate,
                voteAverage: episodes.voteAverage,
                voteCount: episodes.voteCount,
            })
                .from(episodes)
                .innerJoin(seasons, eq(episodes.seasonId, seasons.id))
                .where(eq(seasons.tmdbId, tvId))
                .orderBy(episodes.episodeNumber);

            episodeData = dbEpisodes;
        }

        // Try TMDB if not cached or episodes missing
        try {
            const tmdbSeason = await tmdb.getSeason(tvId, seasonNumber);

            // 1. Ensure Media Item Exists (TV Show)
            let mediaItemId: number | undefined;
            const existingMedia = await db.select({ id: mediaItems.id })
                .from(mediaItems)
                .where(and(eq(mediaItems.tmdbId, tvId), eq(mediaItems.type, MediaType.TV)))
                .limit(1);

            if (existingMedia.length > 0) {
                mediaItemId = existingMedia[0].id;
            } else {
                // Fetch and upsert show if not found
                // We need to fetch the show details to upsert it correctly
                const tmdbShow = await tmdb.getTV(tvId);
                mediaItemId = await upsertMediaItem(db, tmdbShow, MediaType.TV);
            }

            if (!mediaItemId) {
                throw new Error('Failed to resolve media item ID');
            }

            // 2. Upsert Season
            const seasonId = await upsertSeason(db, tmdbSeason, mediaItemId);

            // 3. Upsert Episodes
            if (tmdbSeason.episodes && tmdbSeason.episodes.length > 0 && seasonId) {
                await upsertEpisodes(db, tmdbSeason.episodes, seasonId);
            }

            // 4. Re-fetch episodes from local DB to get consistent Internal IDs
            if (seasonId) {
                episodeData = await db.select({
                    id: episodes.id,
                    episodeNumber: episodes.episodeNumber,
                    name: episodes.name,
                    overview: episodes.overview,
                    stillPath: episodes.stillPath,
                    airDate: episodes.airDate,
                    voteAverage: episodes.voteAverage,
                    voteCount: episodes.voteCount,
                })
                    .from(episodes)
                    .innerJoin(seasons, eq(episodes.seasonId, seasons.id))
                    .where(eq(seasons.id, seasonId))
                    .orderBy(episodes.episodeNumber);
            }

            // If for some reason DB fetch failed or empty (shouldn't happen if upsert worked), fall back to TMDB data (but IDs will be wrong for interaction)
            // But we prioritize DB data now.

            // Build episode response with watch status
            const episodesWithStatus: any[] = episodeData.map((ep: any) => ({
                id: ep.id,
                episode_number: ep.episodeNumber,
                name: ep.name,
                overview: ep.overview,
                still_path: ep.stillPath,
                air_date: ep.airDate,
                vote_average: ep.voteAverage,
            }));

            // If we have user session, add watch status
            if (userId && episodesWithStatus.length > 0) {
                const episodeIds = episodesWithStatus.map((ep: any) => ep.id);
                // Chunk queries if too many episodes? Usually season has < 30 episodes, strict limit for inArray is usually high enough (e.g. 65k parameters in PG)

                const progressRecords = await db.select({
                    episodeId: episodeProgress.episodeId,
                    watched: episodeProgress.watched,
                })
                    .from(episodeProgress)
                    .where(and(
                        eq(episodeProgress.userId, userId),
                        // @ts-ignore
                        inArray(episodeProgress.episodeId, episodeIds)
                    ));

                for (const rec of progressRecords) {
                    const ep = episodesWithStatus.find((e: any) => e.id === rec.episodeId);
                    if (ep) {
                        ep.watched = rec.watched;
                    }
                }
            }

            return new Response(JSON.stringify({
                id: tmdbSeason.id,
                name: tmdbSeason.name,
                overview: tmdbSeason.overview,
                poster_path: tmdbSeason.poster_path,
                air_date: tmdbSeason.air_date,
                season_number: tmdbSeason.season_number,
                episode_count: tmdbSeason.episode_count || episodeData.length,
                episodes: episodesWithStatus,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } catch (tmdbError) {
            console.warn('TMDB API failed, using cached data:', tmdbError);

            if (cachedSeason.length > 0) {
                // ... fallback to return whatever we have in cache
                // The original fallback code is fine here
                const season = cachedSeason[0];
                return new Response(JSON.stringify({
                    id: season.tmdbId,
                    name: season.name,
                    overview: season.overview,
                    poster_path: season.posterPath,
                    air_date: season.airDate,
                    season_number: season.seasonNumber,
                    episode_count: season.episodeCount,
                    episodes: episodeData.map((ep: any) => ({
                        id: ep.id,
                        episode_number: ep.episodeNumber,
                        name: ep.name,
                        overview: ep.overview,
                        still_path: ep.stillPath,
                        air_date: ep.airDate,
                        vote_average: ep.voteAverage,
                    })),
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw tmdbError;
        }

    } catch (error) {
        console.error('Season API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load season details' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
