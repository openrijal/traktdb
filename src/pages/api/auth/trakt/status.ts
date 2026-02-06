import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { accountConnections } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const connection = await db.select({
            providerUsername: accountConnections.providerUsername,
            providerUserId: accountConnections.providerUserId,
            expiresAt: accountConnections.expiresAt,
            createdAt: accountConnections.createdAt,
            lastSyncedAt: accountConnections.lastSyncedAt,
        })
            .from(accountConnections)
            .where(and(
                eq(accountConnections.userId, session.user.id),
                eq(accountConnections.provider, 'trakt')
            ))
            .limit(1);

        if (connection.length === 0) {
            return new Response(JSON.stringify({ 
                connected: false 
            }), { status: 200 });
        }

        const conn = connection[0];
        const isExpired = conn.expiresAt && new Date(conn.expiresAt) < new Date();

        return new Response(JSON.stringify({
            connected: true,
            username: conn.providerUsername,
            userId: conn.providerUserId,
            connectedAt: conn.createdAt,
            lastSyncedAt: conn.lastSyncedAt,
            expired: isExpired,
        }), { status: 200 });
    } catch (error) {
        console.error('Trakt status error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
