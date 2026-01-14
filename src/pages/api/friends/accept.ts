
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { friendships } from 'drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { friendshipId } = body;

        if (!friendshipId) {
            return new Response(JSON.stringify({ error: 'Missing friendshipId' }), { status: 400 });
        }

        const existing = await db.select()
            .from(friendships)
            .where(
                and(
                    eq(friendships.id, friendshipId),
                    eq(friendships.friendId, session.user.id),
                    eq(friendships.status, 'pending')
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response(JSON.stringify({ error: 'Request not found or invalid' }), { status: 404 });
        }

        await db.update(friendships)
            .set({ status: 'accepted', updatedAt: new Date() })
            .where(eq(friendships.id, friendshipId));

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Friend Accept API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
