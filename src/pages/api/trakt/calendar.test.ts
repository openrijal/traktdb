import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './calendar';
import { createTestRequest } from '@/lib/test-utils';

// Mock dependencies
const mockGetSession = vi.fn();
const mockGetCalendarShows = vi.fn();
const mockGetCalendarMovies = vi.fn();

vi.mock('@/lib/auth', () => ({
    createAuth: () => ({
        api: {
            getSession: mockGetSession
        }
    })
}));

vi.mock('@/lib/services/trakt-client', () => ({
    createTrakt: () => ({
        getCalendarShows: mockGetCalendarShows,
        getCalendarMovies: mockGetCalendarMovies
    })
}));

describe('GET /api/trakt/calendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if unauthorized', async () => {
        mockGetSession.mockResolvedValue(null);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns wrapped response with success flag (fix #137)', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue([
            {
                first_aired: '2023-10-01T20:00:00.000Z',
                episode: {
                    season: 1, number: 1, title: 'Pilot',
                    ids: { tmdb: 101, trakt: 201 },
                    overview: 'Episode overview', runtime: 60, rating: 8.5
                },
                show: {
                    title: 'Test Show',
                    ids: { tmdb: 100, trakt: 200, slug: 'test-show' }
                }
            }
        ]);
        mockGetCalendarMovies.mockResolvedValue([]);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data).toHaveLength(1);
    });

    it('normalizes shows with type "show" not "episode" (fix #137)', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue([
            {
                first_aired: '2023-10-01T20:00:00.000Z',
                episode: {
                    season: 1, number: 1, title: 'Pilot',
                    ids: { tmdb: 101, trakt: 201 },
                    overview: '', runtime: 60, rating: 8.5
                },
                show: {
                    title: 'Test Show',
                    ids: { tmdb: 100, trakt: 200, slug: 'test-show' }
                }
            }
        ]);
        mockGetCalendarMovies.mockResolvedValue([]);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        const json = await response.json();
        expect(json.data[0].type).toBe('show');
        expect(json.data[0].title).toBe('Test Show');
        expect(json.data[0].ids.tmdb).toBe(100);
    });

    it('normalizes movies with correct type and fields', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue([]);
        mockGetCalendarMovies.mockResolvedValue([
            {
                released: '2025-04-01',
                movie: {
                    title: 'A Movie',
                    ids: { tmdb: 555, trakt: 666, slug: 'a-movie' },
                    overview: 'Plot', runtime: 90, rating: 6.0
                }
            }
        ]);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        const json = await response.json();
        expect(json.data[0].type).toBe('movie');
        expect(json.data[0].title).toBe('A Movie');
    });

    it('sorts combined results by date', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue([
            {
                first_aired: '2025-04-01T00:00:00.000Z',
                show: { title: 'Later Show', ids: { tmdb: 1, trakt: 1, slug: 'later' } },
                episode: { title: 'Ep', season: 1, number: 1, ids: { tmdb: 10, trakt: 10 }, overview: '', runtime: 30, rating: 7 }
            }
        ]);
        mockGetCalendarMovies.mockResolvedValue([
            {
                released: '2025-03-01',
                movie: { title: 'Earlier Movie', ids: { tmdb: 2, trakt: 2, slug: 'earlier' }, overview: '', runtime: 90, rating: 7 }
            }
        ]);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        const json = await response.json();
        expect(json.data[0].title).toBe('Earlier Movie');
        expect(json.data[1].title).toBe('Later Show');
    });

    it('returns 502 if both Trakt calls return null', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue(null);
        mockGetCalendarMovies.mockResolvedValue(null);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(502);
    });

    it('handles empty calendar gracefully', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockResolvedValue([]);
        mockGetCalendarMovies.mockResolvedValue([]);

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.data).toEqual([]);
    });

    it('returns 500 on unexpected error', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockRejectedValue(new Error('Network error'));

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Internal Server Error' });
    });
});
