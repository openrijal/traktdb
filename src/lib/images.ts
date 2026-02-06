
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type TmdbImageSize = 'card' | 'detail' | 'backdrop' | 'original';

const TMDB_SIZE_MAP: Record<TmdbImageSize, string> = {
    card: 'w500',
    detail: 'w780',
    backdrop: 'w1280',
    original: 'original',
};

/**
 * Build an absolute TMDB image URL from a poster/backdrop path.
 * Returns null when no path is available so callers can fall back gracefully.
 */
export function getTmdbImageUrl(
    path: string | null | undefined,
    size: TmdbImageSize = 'card',
): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${TMDB_SIZE_MAP[size]}${path}`;
}

/**
 * Force a URL to HTTPS. Google Books often returns HTTP thumbnail URLs.
 */
export function ensureHttps(url: string): string {
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
}

/**
 * Extract the best available thumbnail from a Google Books volumeInfo object.
 * Converts to HTTPS automatically.
 */
export function getBookThumbnail(
    volumeInfo: { imageLinks?: { thumbnail?: string; smallThumbnail?: string } } | undefined,
): string | null {
    const url = volumeInfo?.imageLinks?.thumbnail || volumeInfo?.imageLinks?.smallThumbnail;
    return url ? ensureHttps(url) : null;
}

/**
 * Extract the best available artwork URL from a podcast item.
 * Works with both iTunes and ListenNotes response shapes.
 */
export function getPodcastArtwork(
    podcast: {
        artworkUrl600?: string;
        artworkUrl100?: string;
        image?: string;
        thumbnail?: string;
    } | undefined,
): string | null {
    if (!podcast) return null;
    const url = podcast.artworkUrl600 || podcast.artworkUrl100 || podcast.image || podcast.thumbnail;
    return url ? ensureHttps(url) : null;
}
