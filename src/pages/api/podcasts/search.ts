
import type { APIRoute } from 'astro';
import { createITunes } from '@/lib/itunes';
import { createDb } from '@/lib/db';
import { upsertPodcast } from '@/lib/services/podcasts';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const itunes = createITunes();

    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const limit = url.searchParams.get('limit') || '20';

    if (!q) {
        return new Response(JSON.stringify({ error: 'Query parameter "q" is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const searchResults = await itunes.searchPodcasts(q, parseInt(limit));
        const validResults = searchResults.results || [];

        // Upsert podcasts into database for caching/local reference
        if (validResults.length > 0) {
            await Promise.all(validResults.map(podcast => upsertPodcast(db, podcast).catch(e => console.error('Failed to upsert podcast:', e))));
        }

        return new Response(JSON.stringify(searchResults), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Podcast Search API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
