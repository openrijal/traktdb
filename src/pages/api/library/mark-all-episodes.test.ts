
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './mark-all-episodes';

// Mocks
const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' }
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
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


describe('API: /api/library/mark-all-episodes', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mock chain
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.innerJoin.mockReturnValue(mockDb);
        mockDb.where.mockReturnValue(mockDb);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockReturnValue(mockDb);
        mockDb.onConflictDoUpdate.mockReturnValue({});
    });

    describe('POST', () => {
        it('should return 401 if not authenticated', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(null);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ tvId: 1396, markWatched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if tvId is missing', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ markWatched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toContain('Missing tvId');
        });

        it('should return success with count 0 if no episodes exist', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.where.mockReturnValueOnce([]);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ tvId: 999999, markWatched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.count).toBe(0);
        });

        it('should mark all episodes as watched', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.where.mockResolvedValueOnce([
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ]);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ tvId: 1396, markWatched: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.count).toBe(3);
            expect(data.watched).toBe(true);
            // Should insert 3 records
            expect(mockDb.insert).toHaveBeenCalledTimes(3);
        });

        it('should mark all episodes as unwatched when markWatched is false', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.where.mockResolvedValueOnce([
                { id: 1 },
                { id: 2 }
            ]);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ tvId: 1396, markWatched: false }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.success).toBe(true);
            expect(data.count).toBe(2);
            expect(data.watched).toBe(false);
        });

        it('should default markWatched to true if not provided', async () => {
            (createAuth() as any).api.getSession.mockResolvedValue(mockSession);
            mockDb.where.mockResolvedValueOnce([{ id: 1 }]);

            const req = new Request('http://localhost/api/library/mark-all-episodes', {
                method: 'POST',
                body: JSON.stringify({ tvId: 1396 }),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.watched).toBe(true);
        });
    });
});
