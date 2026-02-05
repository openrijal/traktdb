import type { APIRoute } from 'astro';
import { createTrakt } from '@/lib/trakt';
import { groupByDate } from '@/lib/date';
import { createDb } from '@/lib/db';
import { accountConnections } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { format, addDays } from 'date-fns';

const CACHE_TTL = 60 * 60 * 1000;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env || import.meta.env;
  const auth = (await import('@/lib/auth')).createAuth(env);
  const db = createDb(env);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const connection = await db.select({
      accessToken: accountConnections.accessToken,
      providerUserId: accountConnections.providerUserId,
    })
      .from(accountConnections)
      .where(and(
        eq(accountConnections.userId, session.user.id),
        eq(accountConnections.provider, 'trakt')
      ))
      .then((r) => r[0]);

    if (!connection?.accessToken) {
      return new Response(JSON.stringify({ success: false, error: 'Trakt not connected' }), { status: 401 });
    }

    const trakt = createTrakt({
      TRAKT_CLIENT_ID: connection.providerUserId || '',
      TRAKT_ACCESS_TOKEN: connection.accessToken,
    });

    const today = new Date();
    const startDate = format(today, 'yyyy-MM-dd');

    const [shows, movies] = await Promise.all([
      trakt.getCalendarShows(startDate, 30),
      trakt.getCalendarMovies(startDate, 30),
    ]);

    const episodes = shows.map((item) => ({
      id: `${item.show.ids.trakt}-${item.episode.season}-${item.episode.number}`,
      traktEpisodeId: item.episode.ids.trakt,
      traktShowId: item.show.ids.trakt,
      showTitle: item.show.title,
      seasonNumber: item.episode.season,
      episodeNumber: item.episode.number,
      episodeTitle: item.episode.title,
      releaseDate: item.first_aired.split('T')[0],
      tmdbShowId: item.show.ids.tmdb,
      tmdbEpisodeId: item.episode.ids.tmdb,
    }));

    const calendarMovies = movies.map((item) => ({
      id: `${item.movie.ids.trakt}`,
      traktMovieId: item.movie.ids.trakt,
      movieTitle: item.movie.title,
      releaseDate: item.released,
      releaseType: 'theatrical' as const,
      tmdbMovieId: item.movie.ids.tmdb,
    }));

    const allItems = [...episodes, ...calendarMovies];
    const grouped = groupByDate(allItems);

    const days = Array.from(grouped.entries()).map(([date, items]) => ({
      date,
      episodes: items.filter(i => 'episodeNumber' in i),
      movies: items.filter(i => !('episodeNumber' in i)),
    })).sort((a, b) => a.date.localeCompare(b.date));

    return new Response(JSON.stringify({
      success: true,
      data: {
        startDate,
        endDate: format(addDays(today, 30), 'yyyy-MM-dd'),
        fetchedAt: new Date().toISOString(),
        days,
      },
    }), {
      status: 200,
      headers: { 'Cache-Control': `public, max-age=${CACHE_TTL / 1000}` },
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch calendar' }), { status: 500 });
  }
};
