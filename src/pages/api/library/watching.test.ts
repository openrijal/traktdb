import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './watching';
import { createTestRequest } from '@/lib/test-utils';

const mockSession = {
    user: { id: 'user1' },
    session: { id: 'session1' }
};

const mockAuth = {
    api: {
        getSession: vi.fn()
    }
};

const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
};

vi.mock('@/lib/auth', () => ({
    createAuth: () => mockAuth
}));

vi.mock('@/lib/db', () => ({
    createDb: () => mockDb
}));

vi.mock('drizzle-orm', () => ({
    and: vi.fn(),
    eq: vi.fn(),
    desc: vi.fn(),
}));

describe('API: /api/library/watching', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DB mock chain
        mockDb.select.mockReturnValue(mockDb);
        mockDb.from.mockReturnValue(mockDb);
        mockDb.innerJoin.mockReturnValue(mockDb);
        mockDb.where.mockReturnValue(mockDb);
        mockDb.orderBy.mockReturnValue(mockDb);
        mockDb.limit.mockResolvedValue([]);
    });

    it('returns 401 when not authenticated', async () => {
        mockAuth.api.getSession.mockResolvedValue(null);

        const req = createTestRequest('/api/library/watching');
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('returns empty array when no watching items', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.limit.mockResolvedValue([]);

        const req = createTestRequest('/api/library/watching');
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data).toEqual([]);
    });

    it('returns watching items with media details', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        const mockItems = [
            {
                id: 1,
                tmdbId: 100,
                type: 'tv',
                title: 'Breaking Bad',
                posterPath: '/poster.jpg',
                backdropPath: '/backdrop.jpg',
                progress: 5,
                updatedAt: '2025-01-01T00:00:00.000Z',
            },
            {
                id: 2,
                tmdbId: 200,
                type: 'tv',
                title: 'The Office',
                posterPath: '/office.jpg',
                backdropPath: null,
                progress: 12,
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        ];
        mockDb.limit.mockResolvedValue(mockItems);

        const req = createTestRequest('/api/library/watching');
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.data[0].title).toBe('Breaking Bad');
        expect(data.data[1].title).toBe('The Office');
    });

    it('calls DB with correct query chain', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);

        const req = createTestRequest('/api/library/watching');
        await GET({ request: req, locals: {} } as any);

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.from).toHaveBeenCalled();
        expect(mockDb.innerJoin).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
        expect(mockDb.limit).toHaveBeenCalledWith(10);
    });

    it('returns 500 on database error', async () => {
        mockAuth.api.getSession.mockResolvedValue(mockSession);
        mockDb.limit.mockRejectedValue(new Error('DB connection failed'));

        const req = createTestRequest('/api/library/watching');
        const res = await GET({ request: req, locals: {} } as any);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toBe('Internal Server Error');
    });
});
