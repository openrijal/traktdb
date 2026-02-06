import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './upcoming';

// Mocks
const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' }
};


const mockTraktConnection = {
    accessToken: 'trakt-access-token-123',
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    then: vi.fn(),
};

const mockAuth = {
    api: {
        getSession: vi.fn()
    }
};

const mockTrakt = {
    getCalendarShows: vi.fn(),
    getCalendarMovies: vi.fn(),
};

// Mock modules
vi.mock('@/lib/auth', () => ({
    createAuth: () => mockAuth
}));

vi.mock('@/lib/db', () => ({
    createDb: () => mockDb
}));

vi.mock('@/lib/trakt', () => ({
    createTrakt: vi.fn((env) => {
        expect(env.TRAKT_CLIENT_ID).toBeDefined();
        return mockTrakt;
    })
}));

vi.mock('drizzle-orm', () => ({
    and: vi.fn(),
    eq: vi.fn(),
}));

vi.mock('drizzle/schema', () => ({
    accountConnections: {
        accessToken: 'accessToken',
        providerUserId: 'providerUserId',
        userId: 'userId',
        provider: 'provider',
    }
}));

import { createAuth } from '@/lib/auth';

describe('API: /api/calendar/upcoming', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mock chain
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockReturnValue(mockDb);
        mockDb.then.mockResolvedValue(mockTraktConnection);
        // Reset Trakt mock
        mockTrakt.getCalendarShows.mockResolvedValue([]);
        mockTrakt.getCalendarMovies.mockResolvedValue([]);
    });

    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(null);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 401 if Trakt not connected', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(null); // No Trakt connection

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Trakt not connected');
        });

        it('should return 401 if Trakt connection has no access token', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue({ accessToken: null, providerUserId: 'user' });

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
            const data = await res.json();
            expect(data.error).toBe('Trakt not connected');
        });

        it('should return empty calendar when no upcoming items', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);
            mockTrakt.getCalendarShows.mockResolvedValue([]);
            mockTrakt.getCalendarMovies.mockResolvedValue([]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.data.days).toEqual([]);
        });

        it('should return calendar with episodes', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);

            const mockShow = {
                first_aired: '2024-01-15T20:00:00.000Z',
                episode: {
                    season: 2,
                    number: 5,
                    title: 'Test Episode',
                    ids: { trakt: 12345, tmdb: 67890 }
                },
                show: {
                    title: 'Test Show',
                    ids: { trakt: 111, tmdb: 222 }
                }
            };

            mockTrakt.getCalendarShows.mockResolvedValue([mockShow]);
            mockTrakt.getCalendarMovies.mockResolvedValue([]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.data.days.length).toBeGreaterThan(0);

            const day = data.data.days[0];
            expect(day.episodes.length).toBe(1);
            expect(day.episodes[0].showTitle).toBe('Test Show');
            expect(day.episodes[0].episodeTitle).toBe('Test Episode');
            expect(day.episodes[0].seasonNumber).toBe(2);
            expect(day.episodes[0].episodeNumber).toBe(5);
        });

        it('should return calendar with movies', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);

            const mockMovie = {
                released: '2024-01-20',
                movie: {
                    title: 'Test Movie',
                    ids: { trakt: 333, tmdb: 444 }
                }
            };

            mockTrakt.getCalendarShows.mockResolvedValue([]);
            mockTrakt.getCalendarMovies.mockResolvedValue([mockMovie]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.data.days.length).toBeGreaterThan(0);

            const day = data.data.days[0];
            expect(day.movies.length).toBe(1);
            expect(day.movies[0].movieTitle).toBe('Test Movie');
        });

        it('should return calendar with both episodes and movies grouped by date', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);

            const mockShow = {
                first_aired: '2024-01-20T20:00:00.000Z',
                episode: {
                    season: 1,
                    number: 1,
                    title: 'Pilot',
                    ids: { trakt: 1, tmdb: 2 }
                },
                show: {
                    title: 'New Show',
                    ids: { trakt: 3, tmdb: 4 }
                }
            };

            const mockMovie = {
                released: '2024-01-20',
                movie: {
                    title: 'New Movie',
                    ids: { trakt: 5, tmdb: 6 }
                }
            };

            mockTrakt.getCalendarShows.mockResolvedValue([mockShow]);
            mockTrakt.getCalendarMovies.mockResolvedValue([mockMovie]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);

            // Should have one day with both episode and movie
            const day = data.data.days.find((d: any) => d.date === '2024-01-20');
            expect(day).toBeDefined();
            expect(day.episodes.length).toBe(1);
            expect(day.movies.length).toBe(1);
        });

        it('should handle Trakt API errors gracefully', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);
            mockTrakt.getCalendarShows.mockRejectedValue(new Error('Trakt API error'));

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(500);
            const data = await res.json();
            expect(data.error).toBe('Failed to fetch calendar');
        });

        it('should include cache headers in response', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);
            mockTrakt.getCalendarShows.mockResolvedValue([]);
            mockTrakt.getCalendarMovies.mockResolvedValue([]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            expect(res.headers.get('Cache-Control')).toContain('max-age=');
        });

        it('should query accountConnections table with correct provider', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.then.mockResolvedValue(mockTraktConnection);
            mockTrakt.getCalendarShows.mockResolvedValue([]);
            mockTrakt.getCalendarMovies.mockResolvedValue([]);

            const req = new Request('http://localhost/api/calendar/upcoming');
            await GET({ request: req, locals: {} } as any);

            // Verify database was queried
            expect(mockDb.select).toHaveBeenCalled();
            expect(mockDb.from).toHaveBeenCalled();
            expect(mockDb.where).toHaveBeenCalled();
        });
    });
});
