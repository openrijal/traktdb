import type { APIRoute } from 'astro';
import { createDb } from '@/lib/db';
import { episodeProgress, episodes } from 'drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createAuth } from '@/lib/auth';
import { mediaItems, seasons, userProgress } from 'drizzle/schema';
import { createTrakt } from '@/lib/services/trakt-client';
import { WatchStatus } from '@/lib/constants';

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = session.user.id;

    try {
        const body = await request.json();
        const { episodeId, watched } = body;

        if (!episodeId || typeof watched !== 'boolean') {
            return new Response(JSON.stringify({ error: 'Invalid request. Requires episodeId and watched (boolean)' }), { status: 400 });
        }

        // Verify episode exists
        const episode = await db.select({ id: episodes.id })
            .from(episodes)
            .where(eq(episodes.id, episodeId))
            .limit(1);

        if (episode.length === 0) {
            return new Response(JSON.stringify({ error: 'Episode not found' }), { status: 404 });
        }

        // Upsert episode progress
        await db.insert(episodeProgress)
            .values({
                userId,
                episodeId,
                watched,
            })
            .onConflictDoUpdate({
                target: [episodeProgress.userId, episodeProgress.episodeId],
                set: { watched, updatedAt: new Date() },
            });

        // Infer "Watching" status for the series if marked as watched
        if (watched) {
            // Get mediaItemId for this episode
            const result = await db.select({
                mediaItemId: seasons.mediaItemId,
            })
                .from(episodes)
                .innerJoin(seasons, eq(episodes.seasonId, seasons.id))
                .where(eq(episodes.id, episodeId))
                .limit(1);

            if (result.length > 0) {
                const mediaItemId = result[0].mediaItemId;

                // Check current user progress
                const currentProgress = await db.select({
                    status: userProgress.status,
                })
                    .from(userProgress)
                    .where(and(
                        eq(userProgress.userId, userId),
                        eq(userProgress.mediaItemId, mediaItemId)
                    ))
                    .limit(1);

                const currentStatus = currentProgress[0]?.status;

                // If no status, or Plan to Watch, or Dropped -> Change to Watching
                if (!currentStatus ||
                    currentStatus === WatchStatus.PLAN_TO_WATCH ||
                    currentStatus === WatchStatus.DROPPED ||
                    currentStatus === 'clean' // handle legacy/clean state
                ) {

                    await db.insert(userProgress)
                        .values({
                            userId: userId,
                            mediaItemId: mediaItemId,
                            status: WatchStatus.WATCHING,
                            updatedAt: new Date(),
                        })
                        .onConflictDoUpdate({
                            target: [userProgress.userId, userProgress.mediaItemId],
                            set: { status: WatchStatus.WATCHING, updatedAt: new Date() }
                        });
                }
            }
        }

        // Sync to Trakt
        try {
            const trakt = createTrakt(env, userId);
            // We need the TMDB ID for the episode.
            const epData = await db.select({ tmdbId: episodes.tmdbId })
                .from(episodes)
                .where(eq(episodes.id, episodeId))
                .limit(1);

            if (epData.length > 0) {
                await trakt.syncEpisode({ tmdbId: epData[0].tmdbId, watchedAt: new Date() }, watched ? 'add' : 'remove');
            }
        } catch (e) {
            console.error('Trakt episode sync failed', e);
        }

        return new Response(JSON.stringify({ success: true, watched }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Episode Status API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update episode status' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const GET: APIRoute = async ({ url, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: new Headers() });
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = session.user.id;
    const episodeIds = url.searchParams.get('episodeIds')?.split(',').map(Number) || [];

    if (episodeIds.length === 0) {
        return new Response(JSON.stringify({ error: 'No episode IDs provided' }), { status: 400 });
    }

    try {
        const progress = await db.select({
            episodeId: episodeProgress.episodeId,
            watched: episodeProgress.watched,
        })
            .from(episodeProgress)
            .where(and(
                eq(episodeProgress.userId, userId),
                inArray(episodeProgress.episodeId, episodeIds)
            ));

        const statusMap: Record<number, boolean> = {};
        for (const rec of progress) {
            statusMap[rec.episodeId] = rec.watched;
        }

        return new Response(JSON.stringify(statusMap), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Episode Status GET Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch episode status' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
