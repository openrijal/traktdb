import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { mediaItems, userProgress, seasons, episodes, episodeProgress } from 'drizzle/schema';
import { and, eq, or, isNull, asc, inArray } from 'drizzle-orm';
import { WatchStatus, MediaType } from '@/lib/constants';

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

    try {
        // Get watching TV shows
        let watchingQuery = db
            .select({
                mediaItemId: mediaItems.id,
                tmdbId: mediaItems.tmdbId,
            })
            .from(userProgress)
            .innerJoin(mediaItems, eq(userProgress.mediaItemId, mediaItems.id))
            .where(
                and(
                    eq(userProgress.userId, session.user.id),
                    eq(userProgress.status, WatchStatus.WATCHING),
                    eq(mediaItems.type, MediaType.TV)
                )
            )
            .limit(10);

        if (tmdbIdParam) {
            const tmdbId = parseInt(tmdbIdParam);
            if (isNaN(tmdbId)) {
                return new Response(JSON.stringify({ error: 'Invalid tmdbId' }), { status: 400 });
            }
            watchingQuery = db
                .select({
                    mediaItemId: mediaItems.id,
                    tmdbId: mediaItems.tmdbId,
                })
                .from(userProgress)
                .innerJoin(mediaItems, eq(userProgress.mediaItemId, mediaItems.id))
                .where(
                    and(
                        eq(userProgress.userId, session.user.id),
                        eq(userProgress.status, WatchStatus.WATCHING),
                        eq(mediaItems.type, MediaType.TV),
                        eq(mediaItems.tmdbId, tmdbId)
                    )
                )
                .limit(1);
        }

        const watchingShows = await watchingQuery;

        if (watchingShows.length === 0) {
            if (tmdbIdParam) {
                return new Response(JSON.stringify({ success: true, data: null }), { status: 200 });
            }
            return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 });
        }

        const result: Record<number, any> = {};

        for (const show of watchingShows) {
            const nextEp = await db
                .select({
                    episodeId: episodes.id,
                    episodeName: episodes.name,
                    episodeNumber: episodes.episodeNumber,
                    seasonNumber: seasons.seasonNumber,
                    overview: episodes.overview,
                    stillPath: episodes.stillPath,
                    airDate: episodes.airDate,
                    voteAverage: episodes.voteAverage,
                })
                .from(episodes)
                .innerJoin(seasons, eq(episodes.seasonId, seasons.id))
                .leftJoin(
                    episodeProgress,
                    and(
                        eq(episodeProgress.episodeId, episodes.id),
                        eq(episodeProgress.userId, session.user.id)
                    )
                )
                .where(
                    and(
                        eq(seasons.mediaItemId, show.mediaItemId),
                        or(
                            isNull(episodeProgress.watched),
                            eq(episodeProgress.watched, false)
                        )
                    )
                )
                .orderBy(asc(seasons.seasonNumber), asc(episodes.episodeNumber))
                .limit(1);

            result[show.tmdbId] = nextEp.length > 0 ? nextEp[0] : null;
        }

        if (tmdbIdParam) {
            const tmdbId = parseInt(tmdbIdParam);
            return new Response(JSON.stringify({ success: true, data: result[tmdbId] ?? null }), { status: 200 });
        }

        return new Response(JSON.stringify({ success: true, data: result }), { status: 200 });
    } catch (error) {
        console.error('Next Episode API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
