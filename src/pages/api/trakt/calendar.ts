
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createTrakt } from '@/lib/services/trakt-client';

export const GET: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const trakt = createTrakt(env, session.user.id);
        const today = new Date().toISOString().split('T')[0];
        const days = 30;

        const [shows, movies] = await Promise.all([
            trakt.getCalendarShows(today, days),
            trakt.getCalendarMovies(today, days)
        ]);

        if (!shows && !movies) {
            return new Response(JSON.stringify({ error: 'Failed to fetch calendar from Trakt' }), { status: 502 });
        }

        const normalizedShows = (shows || []).map((item: any) => ({
            type: 'episode',
            date: item.first_aired,
            title: item.show.title,
            episodeTitle: item.episode.title,
            season: item.episode.season,
            number: item.episode.number,
            ids: {
                tmdb: item.show.ids.tmdb,
                trakt: item.show.ids.trakt,
                slug: item.show.ids.slug
            },
            episodeIds: {
                tmdb: item.episode.ids.tmdb,
                trakt: item.episode.ids.trakt
            },
            overview: item.episode.overview,
            runtime: item.episode.runtime,
            rating: item.episode.rating
        }));

        const normalizedMovies = (movies || []).map((item: any) => ({
            type: 'movie',
            date: item.released,
            title: item.movie.title,
            ids: {
                tmdb: item.movie.ids.tmdb,
                trakt: item.movie.ids.trakt,
                slug: item.movie.ids.slug
            },
            overview: item.movie.overview,
            runtime: item.movie.runtime,
            rating: item.movie.rating
        }));

        const combined = [...normalizedShows, ...normalizedMovies].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return new Response(JSON.stringify(combined), { status: 200 });

    } catch (error) {
        console.error('Trakt calendar error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
