import type { APIRoute } from 'astro';
import { createTmdb, type TMDBMediaItem, type TMDBSeason } from '@/lib/tmdb';
import { createDb } from '@/lib/db';
import { upsertMediaItem, upsertSeasons } from '@/lib/services/media';
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
        let item: any;
        let seasonData: TMDBSeason[] = [];

        if (mediaType === MediaType.MOVIE) {
            item = await tmdb.getMovie(tmdbId);
        } else {
            const tvShow = await tmdb.getTV(tmdbId);
            item = tvShow;
            seasonData = tvShow.seasons || [];
        }

        // 1. Upsert Main Media Item
        const mediaItemId = await upsertMediaItem(db, item, mediaType);

        // 2. Upsert Seasons (if TV show)
        if (mediaType === MediaType.TV && mediaItemId && seasonData.length > 0) {
            await upsertSeasons(db, seasonData, mediaItemId);
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
