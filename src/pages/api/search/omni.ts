import type { APIRoute } from 'astro';
import { createTmdb } from '@/lib/tmdb';
import { createGoogleBooks } from '@/lib/google-books';
import { createListenNotes } from '@/lib/listennotes';
import { createITunes } from '@/lib/itunes';
import { MediaType } from '@/lib/constants';
import { getTmdbImageUrl, getBookThumbnail, getPodcastArtwork, ensureHttps } from '@/lib/images';

interface OmniResult {
    id: string | number;
    title: string;
    subtitle?: string;
    image: string | null;
    media_type: string;
    url: string;
    year?: string;
    rating?: number;
}

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;

    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam) || 5, 20) : 5;

    if (!q || q.trim().length < 2) {
        return new Response(
            JSON.stringify({ query: q || '', movies: [], tv: [], books: [], podcasts: [], totals: {} }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
    }

    const tmdb = createTmdb(env);
    const googleBooks = createGoogleBooks(env);

    // Fan out to all sources in parallel, tolerating individual failures
    const [tmdbResult, booksResult, podcastResult] = await Promise.allSettled([
        tmdb.searchMulti(q),
        googleBooks.search(q, 0, limit),
        searchPodcasts(env, q, limit),
    ]);

    // --- TMDB: split into movies and TV ---
    let movies: OmniResult[] = [];
    let tv: OmniResult[] = [];
    if (tmdbResult.status === 'fulfilled') {
        const all = tmdbResult.value.results || [];
        movies = all
            .filter((i: any) => i.media_type === MediaType.MOVIE)
            .slice(0, limit)
            .map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                subtitle: (item.release_date || '').substring(0, 4) || undefined,
                image: getTmdbImageUrl(item.poster_path),
                media_type: MediaType.MOVIE,
                url: `/media/movie/${item.id}`,
                year: (item.release_date || '').substring(0, 4) || undefined,
                rating: item.vote_average || undefined,
            }));
        tv = all
            .filter((i: any) => i.media_type === MediaType.TV)
            .slice(0, limit)
            .map((item: any) => ({
                id: item.id,
                title: item.name || item.title,
                subtitle: (item.first_air_date || '').substring(0, 4) || undefined,
                image: getTmdbImageUrl(item.poster_path),
                media_type: MediaType.TV,
                url: `/media/tv/${item.id}`,
                year: (item.first_air_date || '').substring(0, 4) || undefined,
                rating: item.vote_average || undefined,
            }));
    }

    // --- Google Books ---
    let booksArr: OmniResult[] = [];
    if (booksResult.status === 'fulfilled') {
        const items = booksResult.value.items || [];
        booksArr = items.slice(0, limit).map((item: any) => ({
            id: item.id,
            title: item.volumeInfo?.title || 'Untitled',
            subtitle: item.volumeInfo?.authors?.slice(0, 2).join(', ') || undefined,
            image: getBookThumbnail(item.volumeInfo),
            media_type: MediaType.BOOK,
            url: `/search?q=${encodeURIComponent(q)}&tab=books`,
            year: item.volumeInfo?.publishedDate?.substring(0, 4) || undefined,
            rating: item.volumeInfo?.averageRating || undefined,
        }));
    }

    // --- Podcasts (ListenNotes → iTunes fallback) ---
    let podcastsArr: OmniResult[] = [];
    if (podcastResult.status === 'fulfilled') {
        podcastsArr = podcastResult.value;
    }

    const totals = {
        movies: movies.length,
        tv: tv.length,
        books: booksArr.length,
        podcasts: podcastsArr.length,
    };

    return new Response(
        JSON.stringify({ query: q, movies, tv, books: booksArr, podcasts: podcastsArr, totals }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
};

/**
 * Search podcasts via ListenNotes first, falling back to iTunes.
 */
async function searchPodcasts(env: any, query: string, limit: number): Promise<OmniResult[]> {
    const listenNotesKey = env?.LISTEN_NOTES_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.LISTEN_NOTES_API_KEY : undefined);

    // Try ListenNotes first
    if (listenNotesKey) {
        try {
            const ln = createListenNotes(listenNotesKey);
            const data = await ln.searchPodcasts(query);
            return (data.results || []).slice(0, limit).map((p) => ({
                id: p.id,
                title: p.title_original,
                subtitle: p.publisher_original || undefined,
                image: getPodcastArtwork(p),
                media_type: MediaType.PODCAST,
                url: `/search?q=${encodeURIComponent(query)}&tab=podcasts`,
            }));
        } catch {
            // Fall through to iTunes
        }
    }

    // iTunes fallback
    const itunes = createITunes();
    const data = await itunes.searchPodcasts(query, limit);
    return (data.results || []).slice(0, limit).map((p) => ({
        id: p.collectionId,
        title: p.collectionName,
        subtitle: p.artistName || undefined,
        image: getPodcastArtwork(p),
        media_type: MediaType.PODCAST,
        url: `/search?q=${encodeURIComponent(query)}&tab=podcasts`,
    }));
}
