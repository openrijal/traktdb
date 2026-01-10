import type { APIRoute } from 'astro';
import { createTmdb, type TMDBMediaItem } from '@/lib/tmdb';
import { MediaType } from '@/lib/constants';
import { createDb } from '@/lib/db';
import { mediaItems } from 'drizzle/schema';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const tmdb = createTmdb(env);


    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const page = url.searchParams.get('page') || '1';

    if (!q) {
        return new Response(JSON.stringify({ error: 'Query parameter "q" is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const searchResults = await tmdb.searchMulti(q, parseInt(page));

        // Filter for movies and tv shows only
        const validResults = searchResults.results.filter(
            (item) => item.media_type === MediaType.MOVIE || item.media_type === MediaType.TV
        );

        // Prepare data for upsert
        const valuesToInsert = validResults.map((item) => ({
            tmdbId: item.id,
            type: item.media_type as MediaType,
            title: item.title || item.name || 'Unknown',
            originalTitle: item.original_title || item.original_name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date || null,
            voteAverage: Math.round(item.vote_average * 10), // Store as integer (e.g. 7.5 -> 75)
            voteCount: item.vote_count,
        }));

        if (valuesToInsert.length > 0) {
            // Upsert into database
            await db.insert(mediaItems)
                .values(valuesToInsert)
                .onConflictDoUpdate({
                    target: [mediaItems.tmdbId, mediaItems.type],
                    set: {
                        title: sql.raw(`excluded.title`),
                        overview: sql.raw(`excluded.overview`),
                        posterPath: sql.raw(`excluded.poster_path`),
                        backdropPath: sql.raw(`excluded.backdrop_path`),
                        voteAverage: sql.raw(`excluded.vote_average`),
                        voteCount: sql.raw(`excluded.vote_count`),
                        updatedAt: new Date(),
                    }
                });
        }

        return new Response(JSON.stringify({ ...searchResults, results: validResults }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
