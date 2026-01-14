
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { users } from 'drizzle/schema';
import { ilike, ne, or, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get('q');

    if (!q || q.length < 3) {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
    }

    try {
        const searchResults = await db.select({
            id: users.id,
            name: users.name,
            image: users.image,
        })
        .from(users)
        .where(
            and(
                ne(users.id, session.user.id),
                or(
                    ilike(users.name, `%${q}%`),
                    ilike(users.email, `%${q}%`)
                )
            )
        )
        .limit(10);

        return new Response(JSON.stringify({ users: searchResults }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('User Search API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
