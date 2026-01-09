import type { APIRoute } from 'astro';
import { tmdb } from '@/lib/tmdb';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');

    if (!q) {
        return new Response(JSON.stringify({ results: [] }), { status: 200 });
    }

    try {
        const data = await tmdb.searchMulti(q);
        // Filter out people if we only want movies/tv
        // Map to simpler structure if needed, or return as is
        const results = data.results
            .filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv')
            .slice(0, 10)
            .map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                media_type: item.media_type,
                poster_path: item.poster_path, // Full URL logic handled in frontend or here? Frontend does it in MediaCard.
                year: (item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A'
            }));

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('Search API Error:', e);
        return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
    }
};
