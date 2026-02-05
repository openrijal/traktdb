import type { APIRoute } from 'astro';
import { createTmdb, type TMDBMediaItem, type TMDBSeason } from '@/lib/tmdb';
import { createDb } from '@/lib/db';
import { mediaItems } from 'drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { MediaType } from '@/lib/constants';


export const GET: APIRoute = async ({ params, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const tmdb = createTmdb(env);

    const { type, id } = params;
    const tmdbId = parseInt(id!);
    const mediaType = type as MediaType;

    if (!mediaType || (mediaType !== MediaType.MOVIE && mediaType !== MediaType.TV) || isNaN(tmdbId)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
    }

    try {
        // 1. Try to fetch from local database first (for items added to library)
        const cachedItem = await db.select({
            id: mediaItems.id,
            tmdbId: mediaItems.tmdbId,
            type: mediaItems.type,
            title: mediaItems.title,
            originalTitle: mediaItems.originalTitle,
            overview: mediaItems.overview,
            posterPath: mediaItems.posterPath,
            backdropPath: mediaItems.backdropPath,
            releaseDate: mediaItems.releaseDate,
            voteAverage: mediaItems.voteAverage,
            voteCount: mediaItems.voteCount,
            status: mediaItems.status,
        })
            .from(mediaItems)
            .where(and(eq(mediaItems.tmdbId, tmdbId), eq(mediaItems.type, mediaType)))
            .limit(1);

        // 2. Try to fetch from TMDB API
        let item: any;
        let seasonData: TMDBSeason[] = [];

        try {
            if (mediaType === MediaType.MOVIE) {
                item = await tmdb.getMovie(tmdbId);
            } else {
                const tvShow = await tmdb.getTV(tmdbId);
                item = tvShow;
                seasonData = tvShow.seasons || [];
            }
        } catch (tmdbError) {
            console.warn('TMDB API failed, using cached data if available:', tmdbError);
            // If TMDB fails and we have cached data, use it
            if (cachedItem.length > 0) {
                const cached = cachedItem[0];
                return new Response(JSON.stringify({
                    id: cached.tmdbId,
                    title: cached.title,
                    name: cached.type === MediaType.TV ? cached.title : undefined,
                    original_title: cached.originalTitle,
                    original_name: cached.type === MediaType.TV ? cached.originalTitle : undefined,
                    overview: cached.overview,
                    poster_path: cached.posterPath,
                    backdrop_path: cached.backdropPath,
                    release_date: cached.releaseDate,
                    first_air_date: cached.type === MediaType.TV ? cached.releaseDate : undefined,
                    vote_average: cached.voteAverage ? cached.voteAverage / 10 : 0,
                    vote_count: cached.voteCount,
                    status: cached.status,
                    media_type: cached.type,
                    seasons: cached.type === MediaType.TV ? seasonData : undefined,
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            // If neither TMDB nor cache worked, return error
            throw tmdbError;
        }

        // 3. Return TMDB data (already has proper format)
        return new Response(JSON.stringify(item), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Details API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load media details' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
