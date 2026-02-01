
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { podcasts, userPodcastProgress } from 'drizzle/schema';
import { and, eq, or } from 'drizzle-orm';
import { createListenNotes } from '@/lib/listennotes';
import { createITunes } from '@/lib/itunes';
import { upsertPodcast, upsertPodcastFromListenNotes } from '@/lib/services/podcasts';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const externalId = url.searchParams.get('externalId') || url.searchParams.get('itunesId');

    if (!externalId) {
        return new Response(JSON.stringify({ error: 'Missing externalId' }), { status: 400 });
    }

    try {
        const podcast = await db.select({ id: podcasts.id })
            .from(podcasts)
            .where(or(
                eq(podcasts.listenNotesId, externalId),
                eq(podcasts.itunesId, externalId)
            ))
            .limit(1);

        if (podcast.length === 0) {
            return new Response(JSON.stringify({ status: null }), { status: 200 });
        }

        const progress = await db.select()
            .from(userPodcastProgress)
            .where(and(
                eq(userPodcastProgress.userId, session.user.id),
                eq(userPodcastProgress.podcastId, podcast[0].id)
            ))
            .limit(1);

        return new Response(JSON.stringify({
            status: progress.length > 0 ? progress[0].status : null,
            progress: progress.length > 0 ? progress[0].progress : 0,
            updatedAt: progress.length > 0 ? progress[0].updatedAt : null,
        }), { status: 200 });

    } catch (error) {
        console.error('Podcast Status GET Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { externalId, itunesId, status, progress, podcastData } = body;
        
        const lookupId = externalId || itunesId;

        if (!lookupId) {
            return new Response(JSON.stringify({ error: 'Missing externalId' }), { status: 400 });
        }

        if (status === null) {
            const existing = await db.select({ id: podcasts.id }).from(podcasts)
                .where(or(
                    eq(podcasts.listenNotesId, lookupId),
                    eq(podcasts.itunesId, lookupId)
                ))
                .limit(1);

            if (existing.length > 0) {
                await db.delete(userPodcastProgress)
                    .where(and(
                        eq(userPodcastProgress.userId, session.user.id),
                        eq(userPodcastProgress.podcastId, existing[0].id)
                    ));
            }

            return new Response(JSON.stringify({ success: true, status: null }), { status: 200 });
        }

        let podcastId: number | undefined;
        const existing = await db.select({ id: podcasts.id }).from(podcasts)
            .where(or(
                eq(podcasts.listenNotesId, lookupId),
                eq(podcasts.itunesId, lookupId)
            ))
            .limit(1);

        if (existing.length > 0) {
            podcastId = existing[0].id;
        } else if (podcastData) {
            const insertData = {
                listenNotesId: podcastData.listenNotesId || (lookupId.length > 10 ? lookupId : null),
                itunesId: podcastData.itunesId?.toString() || (lookupId.length <= 10 ? lookupId : null),
                collectionName: podcastData.title || 'Unknown Podcast',
                artistName: podcastData.publisher || 'Unknown',
                artworkUrl: podcastData.image || null,
                description: podcastData.description || null,
                genres: [],
                updatedAt: new Date(),
            };

            const inserted = await db.insert(podcasts).values(insertData).returning({ id: podcasts.id });
            podcastId = inserted[0].id;
        } else {
            const listenNotesApiKey = import.meta.env.LISTEN_NOTES_API_KEY;
            
            if (listenNotesApiKey && lookupId.length > 10) {
                const listenNotes = createListenNotes(listenNotesApiKey);
                const podcastInfo = await listenNotes.getPodcast(lookupId);
                podcastId = await upsertPodcastFromListenNotes(db, podcastInfo);
            } else {
                const itunes = createITunes();
                const searchRes = await itunes.getPodcast(lookupId);
                const item = searchRes.results[0];
                if (!item) {
                    return new Response(JSON.stringify({ error: 'Podcast not found' }), { status: 404 });
                }
                podcastId = await upsertPodcast(db, item);
            }
        }

        if (!podcastId) {
            throw new Error('Failed to retrieve or create podcast');
        }

        await db.insert(userPodcastProgress)
            .values({
                userId: session.user.id,
                podcastId: podcastId,
                status: status,
                progress: progress || 0,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userPodcastProgress.userId, userPodcastProgress.podcastId],
                set: {
                    status: status,
                    progress: progress || 0,
                    updatedAt: new Date(),
                }
            });

        return new Response(JSON.stringify({ success: true, status }), { status: 200 });

    } catch (error) {
        console.error('Podcast Status POST Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
