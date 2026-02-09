import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './genres';
import { createTestRequest } from '@/lib/test-utils';

const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' },
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    delete: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
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
    eq: vi.fn(),
}));

vi.mock('drizzle/schema', () => ({
    userGenreInterests: { userId: 'userId', genre: 'genre' },
}));

describe('API: /api/profile/genres', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.where.mockResolvedValue([]);
        mockDb.delete.mockReturnValue(mockDb);
        mockDb.insert.mockReturnValue(mockDb);
        mockDb.values.mockResolvedValue(undefined);
    });

    it('returns 401 if not authenticated', async () => {
        mockAuth.api.getSession.mockResolvedValue(null);
        const req = createTestRequest('/api/profile/genres');
        const res = await GET({ request: req, locals: {} } as any);
        expect(res.status).toBe(401);
    });

    it('returns genres for authenticated user', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.where.mockResolvedValueOnce([{ genre: 'Action' }, { genre: 'Drama' }]);
        const req = createTestRequest('/api/profile/genres');
        const res = await GET({ request: req, locals: {} } as any);
        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.genres).toEqual(['Action', 'Drama']);
    });

    it('rejects invalid payload', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        const req = createTestRequest('/api/profile/genres', { method: 'POST', body: { bad: true } });
        const res = await POST({ request: req, locals: {} } as any);
        expect(res.status).toBe(400);
    });

    it('saves normalized genres', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        const req = createTestRequest('/api/profile/genres', {
            method: 'POST',
            body: { genres: [' Action ', 'Drama', 'Action', '', 'A'.repeat(50)] },
        });
        const res = await POST({ request: req, locals: {} } as any);
        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.genres).toEqual(['Action', 'Drama']);
        expect(mockDb.delete).toHaveBeenCalled();
        expect(mockDb.insert).toHaveBeenCalled();
    });

    it('caps genres to 12 entries', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        const req = createTestRequest('/api/profile/genres', {
            method: 'POST',
            body: {
                genres: Array.from({ length: 20 }, (_, i) => `Genre ${i + 1}`),
            },
        });
        const res = await POST({ request: req, locals: {} } as any);
        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.genres).toHaveLength(12);
    });
});
