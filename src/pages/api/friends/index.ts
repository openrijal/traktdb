
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { friendships, users } from 'drizzle/schema';
import { eq, or, and, ne } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const rawFriendships = await db.select({
            id: friendships.id,
            userId: friendships.userId,
            friendId: friendships.friendId,
            status: friendships.status,
            createdAt: friendships.createdAt,
            user: users,
        })
        .from(friendships)
        .leftJoin(users, or(
            and(eq(friendships.userId, session.user.id), eq(users.id, friendships.friendId)),
            and(eq(friendships.friendId, session.user.id), eq(users.id, friendships.userId))
        ))
        .where(
            or(
                eq(friendships.userId, session.user.id),
                eq(friendships.friendId, session.user.id)
            )
        );

        const friends: any[] = [];
        const incoming: any[] = [];
        const outgoing: any[] = [];

        for (const item of rawFriendships) {
            if (!item.user) continue;

            const friendData = {
                friendshipId: item.id,
                id: item.user.id,
                name: item.user.name,
                image: item.user.image,
                createdAt: item.createdAt,
            };

            if (item.status === 'accepted') {
                friends.push(friendData);
            } else if (item.status === 'pending') {
                if (item.userId === session.user.id) {
                    outgoing.push(friendData);
                } else {
                    incoming.push(friendData);
                }
            }
        }

        return new Response(JSON.stringify({ friends, incoming, outgoing }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Friends List API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
