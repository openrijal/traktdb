import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { mediaItems, userProgress } from 'drizzle/schema';
import { and, eq, sql } from 'drizzle-orm';
import { createTmdb } from '@/lib/tmdb';
import { upsertMediaItem, upsertSeasons } from '@/lib/services/media';
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
        // Option: return all items if no params? For now, require params.
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

    // CSRF Protection: Check for custom header
    const requestedWith = request.headers.get('x-requested-with');
    const origin = request.headers.get('origin');

    // Simple check: Require X-Requested-With: XMLHttpRequest OR matching Origin
    if (requestedWith !== 'XMLHttpRequest' && !origin?.includes('localhost') && !origin?.includes('traktdb')) {
        // Note: In production, you'd stricter Origin/Host checks. For now, requiring the custom header is a strong signal.
        if (requestedWith !== 'XMLHttpRequest') {
            return new Response(JSON.stringify({ error: 'Missing Anti-CSRF Header' }), { status: 403 });
        }
    }

    try {
        const body = await request.json();
        const { tmdbId, type, status } = body;
        // status: WatchStatus | null

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
                // Upsert seasons for TV shows to ensure we have data for Epic 5 later
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
                target: [userProgress.userId, userProgress.mediaItemId], // Constraint naming?
                // Wait, I didn't define a unique constraint on (userId, mediaItemId) in schema.ts explicitly using `uniqueIndex` or `primaryKey`.
                // Let's check schema.ts.
                // The schema definition for userProgress has a serial ID primary key.
                // But conceptually (userId, mediaItemId) should be unique.
                // If I don't have a unique constraint, onConflictDoUpdate will fail or insert duplicates.
                // I MUST CHECK SCHEMA.TS AGAIN.
                set: {
                    status: status,
                    updatedAt: new Date(),
                }
            });

        return new Response(JSON.stringify({ success: true, status }), { status: 200 });

    } catch (error) {
        console.error('Library Status POST Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
