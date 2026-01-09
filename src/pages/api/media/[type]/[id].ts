import type { APIRoute } from 'astro';
import { tmdb, type TMDBMediaItem, type TMDBSeason } from '@/lib/tmdb';
import { db } from '@/lib/db';
import { mediaItems, seasons } from 'drizzle/schema';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
    const { type, id } = params;
    const tmdbId = parseInt(id!);

    if (!type || (type !== 'movie' && type !== 'tv') || isNaN(tmdbId)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        let item: any;
        let seasonData: TMDBSeason[] = [];

        if (type === 'movie') {
            item = await tmdb.getMovie(tmdbId);
        } else {
            const tvShow = await tmdb.getTV(tmdbId);
            item = tvShow;
            seasonData = tvShow.seasons || [];
        }

        // 1. Upsert Main Media Item
        const mediaValues = {
            tmdbId: item.id,
            type: type,
            title: item.title || item.name || 'Unknown',
            originalTitle: item.original_title || item.original_name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!) : null,
            status: item.status,
            voteAverage: Math.round(item.vote_average * 10),
            voteCount: item.vote_count,
        };

        const insertedIds = await db.insert(mediaItems)
            .values(mediaValues)
            .onConflictDoUpdate({
                target: [mediaItems.tmdbId, mediaItems.type],
                set: {
                    title: sql.raw(`excluded.title`),
                    overview: sql.raw(`excluded.overview`),
                    posterPath: sql.raw(`excluded.poster_path`),
                    backdropPath: sql.raw(`excluded.backdrop_path`),
                    status: sql.raw(`excluded.status`),
                    voteAverage: sql.raw(`excluded.vote_average`),
                    voteCount: sql.raw(`excluded.vote_count`),
                    updatedAt: new Date(),
                }
            })
            .returning({ id: mediaItems.id });

        const mediaItemId = insertedIds[0]?.id;

        // 2. Upsert Seasons (if TV show)
        if (type === 'tv' && mediaItemId && seasonData.length > 0) {
            const seasonValues = seasonData.map(s => ({
                tmdbId: s.id,
                mediaItemId: mediaItemId,
                seasonNumber: s.season_number,
                name: s.name,
                overview: s.overview,
                posterPath: s.poster_path,
                airDate: s.air_date ? new Date(s.air_date) : null,
                episodeCount: s.episode_count,
                voteAverage: s.vote_average ? Math.round(s.vote_average * 10) : 0,
            }));

            if (seasonValues.length > 0) {
                await db.insert(seasons)
                    .values(seasonValues)
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
        }

        return new Response(JSON.stringify(item), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Details API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
