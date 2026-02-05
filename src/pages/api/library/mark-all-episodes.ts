import type { APIRoute } from 'astro';
import { createDb } from '@/lib/db';
import { episodeProgress, episodes, seasons, mediaItems } from 'drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createAuth } from '@/lib/auth';

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
        const { tvId, markWatched = true } = body;

        if (!tvId) {
            return new Response(JSON.stringify({ error: 'Missing tvId' }), { status: 400 });
        }

        // Get all episodes for this TV show
        const allEpisodes = await db.select({
            id: episodes.id,
        })
            .from(episodes)
            .innerJoin(seasons, eq(episodes.seasonId, seasons.id))
            .innerJoin(mediaItems, eq(seasons.mediaItemId, mediaItems.id))
            .where(eq(mediaItems.tmdbId, tvId));

        const episodeIds = allEpisodes.map(e => e.id);

        if (episodeIds.length === 0) {
            return new Response(JSON.stringify({ success: true, count: 0 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Upsert all episode progress records
        for (const episodeId of episodeIds) {
            await db.insert(episodeProgress)
                .values({
                    userId,
                    episodeId,
                    watched: markWatched,
                })
                .onConflictDoUpdate({
                    target: [episodeProgress.userId, episodeProgress.episodeId],
                    set: { watched: markWatched, updatedAt: new Date() },
                });
        }

        return new Response(JSON.stringify({
            success: true,
            count: episodeIds.length,
            watched: markWatched,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Mark All Episodes Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update episodes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
