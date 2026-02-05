
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './episode-status';

// Mocks
const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' }
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    onConflictDoUpdate: vi.fn(),
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

vi.mock('drizzle-orm', () => ({
    and: vi.fn(),
    eq: vi.fn(),
    inArray: vi.fn(),
}));

import { createAuth } from '@/lib/auth';


describe('API: /api/library/episode-status', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mock chain
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockReturnValue(mockDb);
        mockDb.limit.mockReturnValue([]);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockReturnValue(mockDb);
        mockDb.onConflictDoUpdate.mockReturnValue({});
    });

    describe('POST', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(null);

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ episodeId: 1, watched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if episodeId is missing', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ watched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 if watched is missing', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ episodeId: 1 }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
        });

        it('should return 404 if episode does not exist', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.limit.mockResolvedValueOnce([]); // Episode not found

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ episodeId: 999, watched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(404);
            const data = await res.json();
            expect(data.error).toBe('Episode not found');
        });

        it('should successfully update episode status', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.limit.mockResolvedValueOnce([{ id: 1 }]); // Episode found

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ episodeId: 1, watched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.onConflictDoUpdate).toHaveBeenCalled();
        });

        it('should successfully mark episode as unwatched', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.limit.mockResolvedValueOnce([{ id: 1 }]);

            const req = new Request('http://localhost/api/library/episode-status', {
                method: 'POST',
                body: JSON.stringify({ episodeId: 1, watched: false }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.watched).toBe(false);
        });
    });

    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(null);

            const req = new Request('http://localhost/api/library/episode-status?episodeIds=1,2,3');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if no episodeIds provided', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);

            const req = new Request('http://localhost/api/library/episode-status');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('No episode IDs');
        });

        it('should return empty object for valid request with no progress', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.limit.mockResolvedValueOnce([]); // No progress records

            const req = new Request('http://localhost/api/library/episode-status?episodeIds=1,2,3');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual({});
        });

        it('should return progress status for episodes', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.limit.mockResolvedValueOnce([
                { episodeId: 1, watched: true },
                { episodeId: 2, watched: false }
            ]);

            const req = new Request('http://localhost/api/library/episode-status?episodeIds=1,2,3');
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data[1]).toBe(true);
            expect(data[2]).toBe(false);
        });
    });
});
