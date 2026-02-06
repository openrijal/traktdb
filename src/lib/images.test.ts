import { describe, it, expect } from 'vitest';
import {
    getTmdbImageUrl,
    ensureHttps,
    getBookThumbnail,
    getPodcastArtwork,
} from './images';

describe('images helpers', () => {
    describe('getTmdbImageUrl', () => {
        it('returns null for null path', () => {
            expect(getTmdbImageUrl(null)).toBeNull();
        });

        it('returns null for undefined path', () => {
            expect(getTmdbImageUrl(undefined)).toBeNull();
        });

        it('returns null for empty string', () => {
            expect(getTmdbImageUrl('')).toBeNull();
        });

        it('builds w500 URL by default (card size)', () => {
            expect(getTmdbImageUrl('/abc.jpg')).toBe(
                'https://image.tmdb.org/t/p/w500/abc.jpg',
            );
        });

        it('builds w780 URL for detail size', () => {
            expect(getTmdbImageUrl('/abc.jpg', 'detail')).toBe(
                'https://image.tmdb.org/t/p/w780/abc.jpg',
            );
        });

        it('builds w1280 URL for backdrop size', () => {
            expect(getTmdbImageUrl('/abc.jpg', 'backdrop')).toBe(
                'https://image.tmdb.org/t/p/w1280/abc.jpg',
            );
        });

        it('builds original URL', () => {
            expect(getTmdbImageUrl('/abc.jpg', 'original')).toBe(
                'https://image.tmdb.org/t/p/original/abc.jpg',
            );
        });
    });

    describe('ensureHttps', () => {
        it('converts HTTP to HTTPS', () => {
            expect(ensureHttps('http://example.com/img.jpg')).toBe(
                'https://example.com/img.jpg',
            );
        });

        it('leaves HTTPS unchanged', () => {
            expect(ensureHttps('https://example.com/img.jpg')).toBe(
                'https://example.com/img.jpg',
            );
        });

        it('leaves non-HTTP URLs unchanged', () => {
            expect(ensureHttps('data:image/svg+xml;base64,abc')).toBe(
                'data:image/svg+xml;base64,abc',
            );
        });
    });

    describe('getBookThumbnail', () => {
        it('returns null for undefined volumeInfo', () => {
            expect(getBookThumbnail(undefined)).toBeNull();
        });

        it('returns null when no imageLinks exist', () => {
            expect(getBookThumbnail({})).toBeNull();
        });

        it('returns null when imageLinks has no URLs', () => {
            expect(getBookThumbnail({ imageLinks: {} })).toBeNull();
        });

        it('prefers thumbnail over smallThumbnail', () => {
            expect(
                getBookThumbnail({
                    imageLinks: {
                        thumbnail: 'https://books.google.com/thumb.jpg',
                        smallThumbnail: 'https://books.google.com/small.jpg',
                    },
                }),
            ).toBe('https://books.google.com/thumb.jpg');
        });

        it('falls back to smallThumbnail', () => {
            expect(
                getBookThumbnail({
                    imageLinks: {
                        smallThumbnail: 'https://books.google.com/small.jpg',
                    },
                }),
            ).toBe('https://books.google.com/small.jpg');
        });

        it('converts HTTP to HTTPS', () => {
            expect(
                getBookThumbnail({
                    imageLinks: {
                        thumbnail: 'http://books.google.com/thumb.jpg',
                    },
                }),
            ).toBe('https://books.google.com/thumb.jpg');
        });
    });

    describe('getPodcastArtwork', () => {
        it('returns null for undefined podcast', () => {
            expect(getPodcastArtwork(undefined)).toBeNull();
        });

        it('returns null for empty object', () => {
            expect(getPodcastArtwork({})).toBeNull();
        });

        it('prefers artworkUrl600', () => {
            expect(
                getPodcastArtwork({
                    artworkUrl600: 'https://cdn.com/600.jpg',
                    artworkUrl100: 'https://cdn.com/100.jpg',
                }),
            ).toBe('https://cdn.com/600.jpg');
        });

        it('falls back to artworkUrl100', () => {
            expect(
                getPodcastArtwork({
                    artworkUrl100: 'https://cdn.com/100.jpg',
                }),
            ).toBe('https://cdn.com/100.jpg');
        });

        it('falls back to ListenNotes image field', () => {
            expect(
                getPodcastArtwork({
                    image: 'https://listennotes.com/img.jpg',
                }),
            ).toBe('https://listennotes.com/img.jpg');
        });

        it('falls back to ListenNotes thumbnail field', () => {
            expect(
                getPodcastArtwork({
                    thumbnail: 'https://listennotes.com/thumb.jpg',
                }),
            ).toBe('https://listennotes.com/thumb.jpg');
        });

        it('converts HTTP to HTTPS', () => {
            expect(
                getPodcastArtwork({
                    artworkUrl600: 'http://cdn.com/600.jpg',
                }),
            ).toBe('https://cdn.com/600.jpg');
        });
    });
});
