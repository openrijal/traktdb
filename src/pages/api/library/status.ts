import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { mediaItems, userProgress } from 'drizzle/schema';
import { and, eq, sql } from 'drizzle-orm';
import { createTmdb } from '@/lib/tmdb';
import { upsertMediaItem, upsertSeasons, bulkUpdateEpisodeStatus } from '@/lib/services/media';
import { createTrakt } from '@/lib/services/trakt-client';
import { MediaType, WatchStatus } from '@/lib/constants';

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
    const tmdbIdParam = url.searchParams.get('tmdbId');
    const typeParam = url.searchParams.get('type');

    if (!tmdbIdParam || !typeParam) {
        return new Response(JSON.stringify({ error: 'Missing tmdbId or type' }), { status: 400 });
    }

    const tmdbId = parseInt(tmdbIdParam);
    const type = typeParam as MediaType;

    try {
        const item = await db.select({
            id: mediaItems.id,
        })
            .from(mediaItems)
            .where(and(eq(mediaItems.tmdbId, tmdbId), eq(mediaItems.type, type)))
            .limit(1);

        if (item.length === 0) {
            return new Response(JSON.stringify({ status: null }), { status: 200 });
        }

        const progress = await db.select()
            .from(userProgress)
            .where(and(
                eq(userProgress.userId, session.user.id),
                eq(userProgress.mediaItemId, item[0].id)
            ))
            .limit(1);

        return new Response(JSON.stringify({
            status: progress.length > 0 ? progress[0].status : null,
            progress: progress.length > 0 ? progress[0].progress : 0,
            updatedAt: progress.length > 0 ? progress[0].updatedAt : null,
        }), { status: 200 });

    } catch (error) {
        console.error('Library Status GET Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);
    const tmdb = createTmdb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // CSRF Protection: Require X-Requested-With header
    const requestedWith = request.headers.get('x-requested-with');

    if (requestedWith !== 'XMLHttpRequest') {
        return new Response(JSON.stringify({ error: 'Missing Anti-CSRF Header' }), { status: 403 });
    }

    try {
        const body = await request.json();
        const { tmdbId, type, status } = body;

        if (!tmdbId || !type || !status) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // 1. Ensure Media Item Exists
        let mediaItemId: number | undefined;
        let tmdbItem: any;

        const existing = await db.select({ id: mediaItems.id }).from(mediaItems)
            .where(and(eq(mediaItems.tmdbId, tmdbId), eq(mediaItems.type, type)))
            .limit(1);

        if (existing.length > 0) {
            mediaItemId = existing[0].id;
        } else {
            // Fetch from TMDB and Upsert
            if (type === MediaType.MOVIE) {
                tmdbItem = await tmdb.getMovie(tmdbId);
            } else {
                const show = await tmdb.getTV(tmdbId);
                tmdbItem = show;
                const newId = await upsertMediaItem(db, tmdbItem, type);
                if (newId && show.seasons) {
                    await upsertSeasons(db, show.seasons, newId);
                }
                mediaItemId = newId;
            }
        }
        if (!mediaItemId && type === MediaType.MOVIE) {
            mediaItemId = await upsertMediaItem(db, tmdbItem, type);
        }

        if (!mediaItemId) {
            throw new Error('Failed to retrieve or create media item');
        }

        // 2. Upsert User Progress
        await db.insert(userProgress)
            .values({
                userId: session.user.id,
                mediaItemId: mediaItemId,
                status: status,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userProgress.userId, userProgress.mediaItemId],
                set: {
                    status: status,
                    updatedAt: new Date(),
                }
            });

        // 3. Trigger Side Effects for TV Shows
        if (type === MediaType.TV) {
            if (status === WatchStatus.COMPLETED) {
                await bulkUpdateEpisodeStatus(db, session.user.id, mediaItemId, true, env);
            } else if (status === WatchStatus.PLAN_TO_WATCH) {
                await bulkUpdateEpisodeStatus(db, session.user.id, mediaItemId, false, env);
            }
        }

        // 4. Sync to Trakt
        try {
            const trakt = createTrakt(env, session.user.id);
            if (status === WatchStatus.COMPLETED) {
                await trakt.syncHistory({ tmdbId, type, watchedAt: new Date() }, 'add');
                await trakt.syncWatchlist({ tmdbId, type }, 'remove');
            } else if (status === WatchStatus.PLAN_TO_WATCH) {
                await trakt.syncWatchlist({ tmdbId, type }, 'add');
                await trakt.syncHistory({ tmdbId, type }, 'remove');
            }
        } catch (e) {
            console.error('Trakt sync failed', e);
        }

        return new Response(JSON.stringify({ success: true, status }), { status: 200 });

    } catch (error) {
        console.error('Library Status POST Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
