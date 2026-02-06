import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './episode-status';
import { createTestRequest } from '@/lib/test-utils';

// Mocks
const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' }
};

const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    then: (resolve: any) => resolve([]), // Default resolve to empty array
};

const mockDb = {
    select: vi.fn(() => mockQueryBuilder),
    insert: vi.fn(() => mockQueryBuilder),
};

// Shared mock auth object
const mockAuth = {
    api: {
        getSession: vi.fn()
    }
};

// Mock modules
vi.mock('@/lib/auth', () => ({
    createAuth: () => mockAuth
}));

vi.mock('@/lib/db', () => ({
    createDb: () => mockDb
}));

vi.mock('../../lib/services/trakt-client', () => ({
    createTrakt: () => ({
        syncEpisode: vi.fn().mockResolvedValue({})
    })
}));

vi.mock('drizzle-orm', () => ({
    and: vi.fn(),
    eq: vi.fn(),
    inArray: vi.fn(),
}));

import { createAuth } from '@/lib/auth';


describe('API: /api/library/episode-status', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mock chain values
        mockQueryBuilder.limit.mockResolvedValue([]);
        // Ensure thenable returns empty array by default
        mockQueryBuilder.then = (resolve: any) => resolve([]);
    });

    describe('POST', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(null);

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { episodeId: 1, watched: true }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if episodeId is missing', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { watched: true }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 if watched is missing', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { episodeId: 1 }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
        });

        it('should return 404 if episode does not exist', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            mockQueryBuilder.limit.mockResolvedValueOnce([]); // Episode not found

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { episodeId: 999, watched: true }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(404);
            const data = await res.json();
            expect(data.error).toBe('Episode not found');
        });

        it('should successfully update episode status', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 1 }]); // Episode found

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { episodeId: 1, watched: true }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockQueryBuilder.onConflictDoUpdate).toHaveBeenCalled();
        });

        it('should successfully mark episode as unwatched', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 1 }]);

            const req = createTestRequest('/api/library/episode-status', {
                method: 'POST',
                body: { episodeId: 1, watched: false }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.watched).toBe(false);
        });
    });

    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(null);

            const req = createTestRequest('/api/library/episode-status', {
                params: { episodeIds: '1,2,3' }
            });
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if no episodeIds provided', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            const req = createTestRequest('/api/library/episode-status');
            const res = await GET({ request: req, url: new URL(req.url), locals: {} } as any);

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('No episode IDs');
        });

        it('should return empty object for valid request with no progress', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            // mockQueryBuilder.then default is [] so no need to mock limit here as logic depends on where() result
            // But wait, GET uses await db.select()...where().
            // Since we mocked then, it resolves. Default is [].


            const req = createTestRequest('/api/library/episode-status', {
                params: { episodeIds: '1,2,3' }
            });
            const res = await GET({ request: req, url: new URL(req.url), locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual({});
        });

        it('should return progress status for episodes', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);
            mockQueryBuilder.then = (resolve: any) => resolve([
                { episodeId: 1, watched: true },
                { episodeId: 2, watched: false }
            ]);

            const req = createTestRequest('/api/library/episode-status', {
                params: { episodeIds: '1,2,3' }
            });
            const res = await GET({ request: req, url: new URL(req.url), locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data[1]).toBe(true);
            expect(data[2]).toBe(false);
        });
    });
});
