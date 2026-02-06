import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './omni';
import { createTestRequest } from '@/lib/test-utils';

// Mock TMDB
const mockTmdb = {
    searchMulti: vi.fn(),
};

vi.mock('@/lib/tmdb', () => ({
    createTmdb: () => mockTmdb,
}));

// Mock Google Books
const mockGoogleBooks = {
    search: vi.fn(),
};

vi.mock('@/lib/google-books', () => ({
    createGoogleBooks: () => mockGoogleBooks,
}));

// Mock ListenNotes
const mockListenNotes = {
    searchPodcasts: vi.fn(),
};

vi.mock('@/lib/listennotes', () => ({
    createListenNotes: () => mockListenNotes,
}));

// Mock iTunes
const mockITunes = {
    searchPodcasts: vi.fn(),
};

vi.mock('@/lib/itunes', () => ({
    createITunes: () => mockITunes,
}));

describe('API: /api/search/omni', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default empty results
        mockTmdb.searchMulti.mockResolvedValue({ results: [] });
        mockGoogleBooks.search.mockResolvedValue({ items: [] });
        mockITunes.searchPodcasts.mockResolvedValue({ results: [] });
    });

    it('returns empty results for missing query', async () => {
        const req = createTestRequest('/api/search/omni');
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.movies).toEqual([]);
        expect(data.tv).toEqual([]);
        expect(data.books).toEqual([]);
        expect(data.podcasts).toEqual([]);
    });

    it('returns empty results for single-character query', async () => {
        const req = createTestRequest('/api/search/omni', {
            params: { q: 'a' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.movies).toEqual([]);
    });

    it('returns categorized results from all sources', async () => {
        mockTmdb.searchMulti.mockResolvedValue({
            results: [
                { id: 1, title: 'Movie A', media_type: 'movie', poster_path: '/m.jpg', release_date: '2024-01-01', vote_average: 8 },
                { id: 2, name: 'Show B', media_type: 'tv', poster_path: '/t.jpg', first_air_date: '2023-05-10', vote_average: 7.5 },
                { id: 3, name: 'Person', media_type: 'person' },
            ],
        });

        mockGoogleBooks.search.mockResolvedValue({
            items: [
                { id: 'b1', volumeInfo: { title: 'Book C', authors: ['Author'], imageLinks: { thumbnail: 'http://books.google.com/thumb.jpg' } } },
            ],
        });

        mockITunes.searchPodcasts.mockResolvedValue({
            results: [
                { collectionId: 99, collectionName: 'Podcast D', artistName: 'Host', artworkUrl600: 'https://cdn.com/art.jpg' },
            ],
        });

        const req = createTestRequest('/api/search/omni', {
            params: { q: 'test' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.query).toBe('test');

        // Movies
        expect(data.movies).toHaveLength(1);
        expect(data.movies[0].title).toBe('Movie A');
        expect(data.movies[0].image).toBe('https://image.tmdb.org/t/p/w500/m.jpg');
        expect(data.movies[0].media_type).toBe('movie');

        // TV
        expect(data.tv).toHaveLength(1);
        expect(data.tv[0].title).toBe('Show B');

        // Books
        expect(data.books).toHaveLength(1);
        expect(data.books[0].title).toBe('Book C');
        // Should be HTTPS
        expect(data.books[0].image).toBe('https://books.google.com/thumb.jpg');

        // Podcasts
        expect(data.podcasts).toHaveLength(1);
        expect(data.podcasts[0].title).toBe('Podcast D');

        // Totals
        expect(data.totals.movies).toBe(1);
        expect(data.totals.tv).toBe(1);
        expect(data.totals.books).toBe(1);
        expect(data.totals.podcasts).toBe(1);
    });

    it('handles partial failures gracefully', async () => {
        mockTmdb.searchMulti.mockRejectedValue(new Error('TMDB down'));
        mockGoogleBooks.search.mockResolvedValue({
            items: [
                { id: 'b1', volumeInfo: { title: 'Book OK' } },
            ],
        });
        mockITunes.searchPodcasts.mockResolvedValue({ results: [] });

        const req = createTestRequest('/api/search/omni', {
            params: { q: 'test' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        // TMDB failed → no movies/tv
        expect(data.movies).toEqual([]);
        expect(data.tv).toEqual([]);
        // Books still work
        expect(data.books).toHaveLength(1);
    });

    it('respects the limit parameter', async () => {
        mockTmdb.searchMulti.mockResolvedValue({
            results: Array.from({ length: 10 }, (_, i) => ({
                id: i,
                title: `Movie ${i}`,
                media_type: 'movie',
                poster_path: null,
            })),
        });
        mockGoogleBooks.search.mockResolvedValue({ items: [] });
        mockITunes.searchPodcasts.mockResolvedValue({ results: [] });

        const req = createTestRequest('/api/search/omni', {
            params: { q: 'test', limit: '3' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(data.movies).toHaveLength(3);
    });

    it('clamps limit to max 20', async () => {
        mockTmdb.searchMulti.mockResolvedValue({ results: [] });
        mockGoogleBooks.search.mockResolvedValue({ items: [] });
        mockITunes.searchPodcasts.mockResolvedValue({ results: [] });

        const req = createTestRequest('/api/search/omni', {
            params: { q: 'test', limit: '100' },
        });
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(200);
        // Just ensure it doesn't crash
        expect(mockGoogleBooks.search).toHaveBeenCalledWith('test', 0, 20);
    });
});
