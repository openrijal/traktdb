import type { APIRoute } from 'astro';
import { createDb } from '@/lib/db';
import { createListenNotes, type ListenNotesPodcast } from '@/lib/listennotes';
import { createITunes } from '@/lib/itunes';
import { upsertPodcast, upsertPodcastFromListenNotes } from '@/lib/services/podcasts';

export const GET: APIRoute = async ({ request, locals }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!query) {
        return new Response(JSON.stringify({ error: 'Query parameter q is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const listenNotesApiKey = import.meta.env.LISTEN_NOTES_API_KEY;
    
    if (listenNotesApiKey) {
        return searchWithListenNotes(query, limit, locals);
    } else {
        return searchWithItunes(query, limit, locals);
    }
};

async function searchWithListenNotes(query: string, limit: number, locals: any) {
    const db = createDb(locals.runtime.env);
    const listenNotes = createListenNotes(import.meta.env.LISTEN_NOTES_API_KEY);

    try {
        const searchResult = await listenNotes.searchPodcasts(query);
        const podcasts = searchResult.results.slice(0, limit);
        
        const upsertedPodcasts = await Promise.all(
            podcasts.map(async (podcast: ListenNotesPodcast) => {
                try {
                    const dbId = await upsertPodcastFromListenNotes(db, podcast);
                    return {
                        id: dbId,
                        listenNotesId: podcast.id,
                        collectionId: podcast.itunes_id,
                        collectionName: podcast.title_original,
                        artistName: podcast.publisher_original,
                        artworkUrl100: podcast.thumbnail,
                        artworkUrl600: podcast.image,
                        description: podcast.description_original,
                        totalEpisodes: podcast.total_episodes,
                        listenScore: podcast.listen_score,
                    };
                } catch (e) {
                    console.error('Failed to upsert podcast:', e);
                    return null;
                }
            })
        );

        return new Response(
            JSON.stringify({
                results: upsertedPodcasts.filter(Boolean),
                total: searchResult.total,
                source: 'listennotes',
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Listen Notes search error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to search podcasts', details: String(error) }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

async function searchWithItunes(query: string, limit: number, locals: any) {
    const db = createDb(locals.runtime.env);
    const itunes = createITunes();

    try {
        const result = await itunes.searchPodcasts(query, limit);

        await Promise.all(
            result.results.map(async (podcast) => {
                try {
                    await upsertPodcast(db, podcast);
                } catch (e) {
                    console.error('Failed to upsert podcast:', e);
                }
            })
        );

        return new Response(JSON.stringify({ 
            ...result,
            source: 'itunes',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('iTunes search error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to search podcasts' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
