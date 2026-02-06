import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { mediaItems, userProgress, books, userBookProgress, podcasts, podcastEpisodes, userPodcastProgress } from 'drizzle/schema';
import { and, eq, desc } from 'drizzle-orm';
import { MediaType } from '@/lib/constants';

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
    const typeParam = url.searchParams.get('type');
    const statusParam = url.searchParams.get('status');

    if (!typeParam || !statusParam) {
        return new Response(JSON.stringify({ error: 'Missing type or status parameter' }), { status: 400 });
    }

    if (!Object.values(MediaType).includes(typeParam as MediaType)) {
        return new Response(JSON.stringify({ error: 'Invalid type parameter' }), { status: 400 });
    }

    const currentType = typeParam as MediaType;

    try {
        let items: any[] = [];

        if (currentType === MediaType.MOVIE || currentType === MediaType.TV) {
            const raw = await db
                .select({
                    progress: userProgress,
                    media: mediaItems,
                })
                .from(userProgress)
                .innerJoin(mediaItems, eq(userProgress.mediaItemId, mediaItems.id))
                .where(
                    and(
                        eq(userProgress.userId, session.user.id),
                        eq(mediaItems.type, currentType),
                        eq(userProgress.status, statusParam),
                    ),
                )
                .orderBy(desc(userProgress.updatedAt));

            items = raw.map((i) => ({
                ...i.media,
                id: i.media.tmdbId,
                media_type: i.media.type,
                poster_path: i.media.posterPath,
                vote_average: i.media.voteAverage || 0,
                release_date: i.media.releaseDate || undefined,
                first_air_date: i.media.releaseDate || undefined,
                last_air_date: i.media.lastAirDate || undefined,
                lastAirDate: i.media.lastAirDate || undefined,
            }));
        } else if (currentType === MediaType.BOOK || currentType === MediaType.EBOOK) {
            const isEbook = currentType === MediaType.EBOOK;
            const raw = await db
                .select({
                    progress: userBookProgress,
                    book: books,
                })
                .from(userBookProgress)
                .innerJoin(books, eq(userBookProgress.bookId, books.id))
                .where(
                    and(
                        eq(userBookProgress.userId, session.user.id),
                        eq(books.isEbook, isEbook),
                        eq(userBookProgress.status, statusParam),
                    ),
                )
                .orderBy(desc(userBookProgress.updatedAt));

            items = raw.map((i) => ({
                id: i.book.googleId,
                volumeInfo: {
                    title: i.book.title,
                    authors: i.book.authors || [],
                    imageLinks: {
                        thumbnail: i.book.thumbnail || undefined,
                    },
                    publishedDate: i.book.publishedDate || undefined,
                    averageRating: i.book.averageRating
                        ? i.book.averageRating / 10
                        : undefined,
                },
            }));
        } else if (currentType === MediaType.PODCAST) {
            const raw = await db
                .select({
                    progress: userPodcastProgress,
                    podcast: podcasts,
                })
                .from(userPodcastProgress)
                .innerJoin(podcasts, eq(userPodcastProgress.podcastId, podcasts.id))
                .where(
                    and(
                        eq(userPodcastProgress.userId, session.user.id),
                        eq(userPodcastProgress.status, statusParam),
                    ),
                )
                .orderBy(desc(userPodcastProgress.updatedAt));

            items = raw.map((i) => ({
                id: i.podcast.listenNotesId || i.podcast.itunesId || i.podcast.id.toString(), // Prefer external ID, fallback to DB ID
                listenNotesId: i.podcast.listenNotesId,
                itunesId: i.podcast.itunesId ? parseInt(i.podcast.itunesId) : undefined,
                collectionId: i.podcast.itunesId ? parseInt(i.podcast.itunesId) : i.podcast.id, // Fallback for components strictly needing collectionId but better to use id
                collectionName: i.podcast.collectionName,
                artistName: i.podcast.artistName,
                artworkUrl600: i.podcast.artworkUrl || undefined,
            }));
        }

        return new Response(JSON.stringify({ items, type: currentType, status: statusParam, total: items.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Library Items GET Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
