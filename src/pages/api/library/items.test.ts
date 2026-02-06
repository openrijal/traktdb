import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './items';
import { createTestRequest } from '@/lib/test-utils';

const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' },
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
};

const mockAuth = {
    api: {
        getSession: vi.fn(),
    },
};

vi.mock('@/lib/auth', () => ({
    createAuth: () => mockAuth,
}));

vi.mock('@/lib/db', () => ({
    createDb: () => mockDb,
}));

vi.mock('drizzle-orm', () => ({
    and: vi.fn(),
    eq: vi.fn(),
    desc: vi.fn(),
}));

vi.mock('drizzle/schema', () => ({
    mediaItems: { id: 'id', tmdbId: 'tmdbId', type: 'type', posterPath: 'posterPath' },
    userProgress: { userId: 'userId', mediaItemId: 'mediaItemId', status: 'status', updatedAt: 'updatedAt' },
    books: { id: 'id', googleId: 'googleId', isEbook: 'isEbook' },
    userBookProgress: { userId: 'userId', bookId: 'bookId', status: 'status', updatedAt: 'updatedAt' },
    podcasts: { id: 'id', itunesId: 'itunesId' },
    userPodcastProgress: { userId: 'userId', podcastId: 'podcastId', status: 'status', updatedAt: 'updatedAt' },
}));

describe('API: /api/library/items', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the chainable mock
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.innerJoin.mockReturnValue(mockDb);
        mockDb.where.mockReturnValue(mockDb);
        mockDb.orderBy.mockResolvedValue([]);
    });

    it('returns 401 if not authenticated', async () => {
        mockAuth.api.getSession.mockResolvedValue(null);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'movie', status: 'watching' },
        });
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(401);
    });

    it('returns 400 if type param is missing', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);

        const req = createTestRequest('/api/library/items', {
            params: { status: 'watching' },
        });
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(400);
    });

    it('returns 400 if status param is missing', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'movie' },
        });
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid type param', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'invalid', status: 'watching' },
        });
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(400);
    });

    it('returns movie items with correct shape', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.orderBy.mockResolvedValueOnce([
            {
                progress: { userId: 'user1', status: 'watching' },
                media: {
                    id: 1,
                    tmdbId: 100,
                    type: 'movie',
                    title: 'Test Movie',
                    posterPath: '/poster.jpg',
                    voteAverage: 8.5,
                    releaseDate: '2024-01-01',
                    lastAirDate: null,
                },
            },
        ]);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'movie', status: 'watching' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.items).toHaveLength(1);
        expect(data.items[0].id).toBe(100);
        expect(data.items[0].poster_path).toBe('/poster.jpg');
        expect(data.type).toBe('movie');
        expect(data.total).toBe(1);
    });

    it('returns book items with correct shape', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.orderBy.mockResolvedValueOnce([
            {
                progress: { userId: 'user1', status: 'reading' },
                book: {
                    id: 1,
                    googleId: 'gbook1',
                    title: 'Test Book',
                    authors: ['Author A'],
                    thumbnail: 'http://books.google.com/thumb.jpg',
                    publishedDate: '2023-06-15',
                    averageRating: 45,
                    isEbook: false,
                },
            },
        ]);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'book', status: 'reading' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.items).toHaveLength(1);
        expect(data.items[0].id).toBe('gbook1');
        expect(data.items[0].volumeInfo.title).toBe('Test Book');
        expect(data.items[0].volumeInfo.averageRating).toBe(4.5);
    });

    it('returns podcast items with correct shape', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.orderBy.mockResolvedValueOnce([
            {
                progress: { userId: 'user1', status: 'listening' },
                podcast: {
                    id: 1,
                    itunesId: '12345',
                    collectionName: 'Test Podcast',
                    artistName: 'Podcaster',
                    artworkUrl: 'https://cdn.com/art.jpg',
                },
            },
        ]);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'podcast', status: 'listening' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.items).toHaveLength(1);
        expect(data.items[0].collectionId).toBe(12345);
        expect(data.items[0].collectionName).toBe('Test Podcast');
    });

    it('returns empty array when no items found', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.orderBy.mockResolvedValueOnce([]);

        const req = createTestRequest('/api/library/items', {
            params: { type: 'movie', status: 'plan_to_watch' },
        });
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.items).toHaveLength(0);
        expect(data.total).toBe(0);
    });
});
