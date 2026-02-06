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

    it('returns calendar data on success', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });

        mockGetCalendarShows.mockResolvedValue([
            {
                first_aired: '2023-10-01T20:00:00.000Z',
                episode: {
                    season: 1,
                    number: 1,
                    title: 'Pilot',
                    ids: { tmdb: 101, trakt: 201 },
                    overview: 'Episode overview',
                    runtime: 60,
                    rating: 8.5
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
        const data = await response.json();
        expect(data).toHaveLength(1);
        expect(data[0].type).toBe('episode');
        expect(data[0].title).toBe('Test Show');
    });

    it('returns 502 if Trakt API fails', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user123' } });
        mockGetCalendarShows.mockRejectedValue(new Error('Trakt Error'));

        const response = await GET({
            request: createTestRequest('/api/trakt/calendar'),
            locals: { runtime: { env: {} } }
        } as any);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Internal Server Error' });
    });
});
