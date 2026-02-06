import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { mediaItems, userProgress } from 'drizzle/schema';
import { and, eq, desc } from 'drizzle-orm';
import { WatchStatus } from '@/lib/constants';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const results = await db
            .select({
                id: mediaItems.id,
                tmdbId: mediaItems.tmdbId,
                type: mediaItems.type,
                title: mediaItems.title,
                posterPath: mediaItems.posterPath,
                backdropPath: mediaItems.backdropPath,
                progress: userProgress.progress,
                updatedAt: userProgress.updatedAt,
            })
            .from(userProgress)
            .innerJoin(mediaItems, eq(userProgress.mediaItemId, mediaItems.id))
            .where(
                and(
                    eq(userProgress.userId, session.user.id),
                    eq(userProgress.status, WatchStatus.WATCHING)
                )
            )
            .orderBy(desc(userProgress.updatedAt))
            .limit(10);

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200 });
    } catch (error) {
        console.error('Library Watching GET Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
