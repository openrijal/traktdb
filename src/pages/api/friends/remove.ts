
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { friendships } from 'drizzle/schema';
import { eq, or, and } from 'drizzle-orm';

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
                    or(
                        eq(friendships.userId, session.user.id),
                        eq(friendships.friendId, session.user.id)
                    )
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return new Response(JSON.stringify({ error: 'Friendship not found' }), { status: 404 });
        }

        await db.delete(friendships)
            .where(eq(friendships.id, friendshipId));

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Friend Remove API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
