import type { APIRoute } from 'astro';
import { createListenNotes } from '@/lib/listennotes';
import { createITunes } from '@/lib/itunes';

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: 'Podcast ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const listenNotesApiKey = import.meta.env.LISTEN_NOTES_API_KEY;

    if (listenNotesApiKey) {
        return fetchFromListenNotes(id, listenNotesApiKey);
    } else {
        return fetchFromItunes(id);
    }
};

async function fetchFromListenNotes(id: string, apiKey: string) {
    const listenNotes = createListenNotes(apiKey);

    try {
        const podcast = await listenNotes.getPodcast(id);

        return new Response(
            JSON.stringify({
                id: podcast.id,
                listenNotesId: podcast.id,
                itunesId: podcast.itunes_id,
                title: podcast.title_original,
                publisher: podcast.publisher_original,
                description: podcast.description_original,
                image: podcast.image,
                thumbnail: podcast.thumbnail,
                totalEpisodes: podcast.total_episodes,
                listenScore: typeof podcast.listen_score === 'number' ? podcast.listen_score : null,
                website: podcast.website,
                genres: podcast.genre_ids,
                explicitContent: podcast.explicit_content,
                listennotesUrl: podcast.listennotes_url,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Listen Notes fetch error:', error);
        
        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
            return new Response(JSON.stringify({ error: 'Podcast not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ error: 'Failed to fetch podcast' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

async function fetchFromItunes(id: string) {
    const itunes = createITunes();

    try {
        const result = await itunes.getPodcast(id);

        if (!result.results || result.results.length === 0) {
            return new Response(JSON.stringify({ error: 'Podcast not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const podcast = result.results[0];

        return new Response(
            JSON.stringify({
                id: podcast.collectionId.toString(),
                itunesId: podcast.collectionId,
                title: podcast.collectionName,
                publisher: podcast.artistName,
                description: null,
                image: podcast.artworkUrl600 || podcast.artworkUrl100,
                thumbnail: podcast.artworkUrl100,
                totalEpisodes: null,
                genres: podcast.genres,
                feedUrl: podcast.feedUrl,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('iTunes fetch error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch podcast' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
