import type { APIRoute } from 'astro';
import { createListenNotes, type ListenNotesPodcast } from '@/lib/listennotes';
import { createITunes } from '@/lib/itunes';

export const GET: APIRoute = async ({ request }) => {
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
        return searchWithListenNotes(query, limit, listenNotesApiKey);
    } else {
        return searchWithItunes(query, limit);
    }
};

async function searchWithListenNotes(query: string, limit: number, apiKey: string) {
    const listenNotes = createListenNotes(apiKey);

    try {
        const searchResult = await listenNotes.searchPodcasts(query);
        const podcasts = searchResult.results.slice(0, limit);
        
        const formattedPodcasts = podcasts.map((podcast: ListenNotesPodcast) => ({
            id: podcast.id,
            listenNotesId: podcast.id,
            itunesId: podcast.itunes_id,
            title: podcast.title_original,
            publisher: podcast.publisher_original,
            image: podcast.image,
            thumbnail: podcast.thumbnail,
            description: podcast.description_original,
            totalEpisodes: podcast.total_episodes,
            listenScore: typeof podcast.listen_score === 'number' ? podcast.listen_score : null,
        }));

        return new Response(
            JSON.stringify({
                results: formattedPodcasts,
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

async function searchWithItunes(query: string, limit: number) {
    const itunes = createITunes();

    try {
        const result = await itunes.searchPodcasts(query, limit);

        const formattedPodcasts = result.results.map(podcast => ({
            id: podcast.collectionId.toString(),
            itunesId: podcast.collectionId,
            title: podcast.collectionName,
            publisher: podcast.artistName,
            image: podcast.artworkUrl600 || podcast.artworkUrl100,
            thumbnail: podcast.artworkUrl100,
            description: null,
            totalEpisodes: null,
        }));

        return new Response(JSON.stringify({ 
            results: formattedPodcasts,
            total: result.resultCount,
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
