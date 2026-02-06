import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { podcasts, podcastEpisodes } from 'drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { createITunes } from '@/lib/itunes';
import { createListenNotes } from '@/lib/listennotes';
import { upsertPodcast, upsertPodcastFromListenNotes, refreshPodcastEpisodes } from '@/lib/services/podcasts';

export const GET: APIRoute = async ({ params, request, locals }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
    }

    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);

    try {
        // 1. Try to find in DB
        const idNum = parseInt(id);
        const isNum = !isNaN(idNum) && /^\d+$/.test(id);

        let podcast = await db.query.podcasts.findFirst({
            where: (podcasts, { eq, or }) => isNum
                ? or(eq(podcasts.id, idNum), eq(podcasts.itunesId, id), eq(podcasts.listenNotesId, id))
                : or(eq(podcasts.itunesId, id), eq(podcasts.listenNotesId, id)),
        });

        // 2. If not found, try to fetch from external sources and upsert
        if (!podcast) {
            // Is it an iTunes ID (numeric)?
            if (/^\d+$/.test(id)) {
                const itunes = createITunes();
                try {
                    const data = await itunes.getPodcast(id);
                    if (data.results && data.results.length > 0) {
                        const newId = await upsertPodcast(db, data.results[0]);
                        podcast = await db.query.podcasts.findFirst({
                            where: eq(podcasts.id, newId),
                        });
                    }
                } catch (e) {
                    console.error('Failed to fetch from iTunes:', e);
                }
            }

            // If still not found, try ListenNotes if we have a key and looks like an ID
            if (!podcast && env.LISTEN_NOTES_API_KEY) {
                const listenNotes = createListenNotes(env.LISTEN_NOTES_API_KEY);
                try {
                    const data = await listenNotes.getPodcast(id);
                    if (data) {
                        const newId = await upsertPodcastFromListenNotes(db, data);
                        podcast = await db.query.podcasts.findFirst({
                            where: eq(podcasts.id, newId),
                        });
                    }
                } catch (e) {
                    console.error('Failed to fetch from ListenNotes:', e);
                }
            }
        }

        if (!podcast) {
            return new Response(JSON.stringify({ error: 'Podcast not found' }), { status: 404 });
        }

        // 3. Refresh episodes (async, but we await it for now to ensure user sees something on first load)
        await refreshPodcastEpisodes(db, podcast.id);

        // 4. Fetch episodes
        const episodes = await db.select()
            .from(podcastEpisodes)
            .where(eq(podcastEpisodes.podcastId, podcast.id))
            .orderBy(desc(podcastEpisodes.pubDate))
            .limit(100);

        return new Response(JSON.stringify({
            ...podcast,
            title: podcast.collectionName,
            publisher: podcast.artistName,
            image: podcast.artworkUrl,
            episodes: episodes,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Podcast details error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
