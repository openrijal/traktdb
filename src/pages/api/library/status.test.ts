import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './status';
import { createTestRequest } from '@/lib/test-utils';

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
    sql: vi.fn(),
}));

import { createAuth } from '@/lib/auth'; // valid import now that we mocked it


describe('API: /api/library/status', () => {

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

    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            // Access the mock directly via the imported module function
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(null);

            const req = createTestRequest('/api/library/status', {
                params: { tmdbId: '100', type: 'movie' }
            });
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(401);
        });

        it('should return 400 if params are missing', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            const req = createTestRequest('/api/library/status'); // Partial params
            const res = await GET({ request: req, locals: {} } as any);

            expect(res.status).toBe(400);
        });

        // Add more tests for successful retrieval...
    });

    describe('POST', () => {
        it('should return 403 if CSRF header is missing', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            const req = createTestRequest('/api/library/status', {
                method: 'POST',
                body: { tmdbId: 100, type: 'movie', status: 'watching' }
                // Missing X-Requested-With
            });
            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.error).toBe('Missing Anti-CSRF Header');
        });

        it('should succeed with valid auth and headers', async () => {
            (createAuth({} as any) as any).api.getSession.mockResolvedValue(mockSession);

            // Mock DB find existing media
            mockDb.limit.mockResolvedValueOnce([{ id: 1 }]); // Found media item

            const req = createTestRequest('/api/library/status', {
                method: 'POST',
                body: { tmdbId: 100, type: 'movie', status: 'watching' },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const res = await POST({ request: req, locals: {} } as any);

            expect(res.status).toBe(200);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });
});
