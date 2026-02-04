import type { APIRoute } from 'astro';
import { createTmdb, type TMDBMediaItem, type TMDBSeason } from '@/lib/tmdb';
import { createAuth } from '@/lib/auth';
import { MediaType } from '@/lib/constants';


export const GET: APIRoute = async ({ params, locals, request }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const tmdb = createTmdb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

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

        // 1. Fetched from TMDB, just pass through.
        // DB Upserts are now handled when user adds to library (POST /api/library/status)


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
