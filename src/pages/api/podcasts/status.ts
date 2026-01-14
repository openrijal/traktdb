
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { podcasts, userPodcastProgress } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { createITunes } from '@/lib/itunes';
import { upsertPodcast } from '@/lib/services/podcasts';

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
    const itunesId = url.searchParams.get('itunesId');

    if (!itunesId) {
        return new Response(JSON.stringify({ error: 'Missing itunesId' }), { status: 400 });
    }

    try {
        const podcast = await db.select({ id: podcasts.id })
            .from(podcasts)
            .where(eq(podcasts.itunesId, itunesId))
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
    const itunes = createITunes();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { itunesId, status, progress } = body;

        if (!itunesId || !status) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if podcast exists, if not fetch and create
        let podcastId: number | undefined;
        const existing = await db.select({ id: podcasts.id }).from(podcasts)
            .where(eq(podcasts.itunesId, itunesId))
            .limit(1);

        if (existing.length > 0) {
            podcastId = existing[0].id;
        } else {
            // Need to fetch details from iTunes if not in DB
            const searchRes = await itunes.getPodcast(itunesId);
            const item = searchRes.results[0];
            if (!item) {
                return new Response(JSON.stringify({ error: 'Podcast not found' }), { status: 404 });
            }
            podcastId = await upsertPodcast(db, item);
        }

        if (!podcastId) {
            throw new Error('Failed to retrieve or create podcast');
        }

        // Upsert progress
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
