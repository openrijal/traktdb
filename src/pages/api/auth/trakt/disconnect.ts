import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { accountConnections } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // CSRF Protection
    const requestedWith = request.headers.get('x-requested-with');
    if (requestedWith !== 'XMLHttpRequest') {
        return new Response(JSON.stringify({ error: 'Missing Anti-CSRF Header' }), { status: 403 });
    }

    try {
        // Optionally revoke the token at Trakt (best practice)
        const connection = await db.select()
            .from(accountConnections)
            .where(and(
                eq(accountConnections.userId, session.user.id),
                eq(accountConnections.provider, 'trakt')
            ))
            .limit(1);

        if (connection.length > 0) {
            const clientId = env.TRAKT_CLIENT_ID || import.meta.env.TRAKT_CLIENT_ID;
            const clientSecret = env.TRAKT_CLIENT_SECRET || import.meta.env.TRAKT_CLIENT_SECRET;

            // Attempt to revoke token at Trakt (non-blocking)
            if (clientId && clientSecret) {
                fetch('https://api.trakt.tv/oauth/revoke', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: connection[0].accessToken,
                        client_id: clientId,
                        client_secret: clientSecret,
                    }),
                }).catch(err => console.error('Failed to revoke Trakt token:', err));
            }
        }

        // Delete the connection from our database
        await db.delete(accountConnections)
            .where(and(
                eq(accountConnections.userId, session.user.id),
                eq(accountConnections.provider, 'trakt')
            ));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Trakt disconnect error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
