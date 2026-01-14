
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
        const { targetUserId } = body;

        if (!targetUserId || targetUserId === session.user.id) {
            return new Response(JSON.stringify({ error: 'Invalid target user' }), { status: 400 });
        }

        const existing = await db.select()
            .from(friendships)
            .where(
                or(
                    and(eq(friendships.userId, session.user.id), eq(friendships.friendId, targetUserId)),
                    and(eq(friendships.userId, targetUserId), eq(friendships.friendId, session.user.id))
                )
            )
            .limit(1);

        if (existing.length > 0) {
            return new Response(JSON.stringify({ error: 'Friendship or request already exists' }), { status: 409 });
        }

        await db.insert(friendships).values({
            userId: session.user.id,
            friendId: targetUserId,
            status: 'pending',
        });

        return new Response(JSON.stringify({ success: true }), { status: 201 });

    } catch (error) {
        console.error('Friend Request API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
