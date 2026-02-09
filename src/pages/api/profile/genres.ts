import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { userGenreInterests } from 'drizzle/schema';
import { eq } from 'drizzle-orm';

const MAX_GENRES = 12;
const MAX_GENRE_LEN = 40;

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const rows = await db
        .select({ genre: userGenreInterests.genre })
        .from(userGenreInterests)
        .where(eq(userGenreInterests.userId, session.user.id));

    return new Response(JSON.stringify({ genres: rows.map((r) => r.genre) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    let body: any = null;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    const genresInput = Array.isArray(body?.genres) ? body.genres : null;
    if (!genresInput) {
        return new Response(JSON.stringify({ error: 'Invalid genres' }), { status: 400 });
    }

    const normalized = Array.from(
        new Set(
            genresInput
                .filter((g: any) => typeof g === 'string')
                .map((g: string) => g.trim())
                .filter((g: string) => g.length > 0 && g.length <= MAX_GENRE_LEN),
        ),
    ).slice(0, MAX_GENRES);

    await db.delete(userGenreInterests).where(eq(userGenreInterests.userId, session.user.id));

    if (normalized.length > 0) {
        await db.insert(userGenreInterests).values(
            normalized.map((genre) => ({
                userId: session.user.id,
                genre,
            })),
        );
    }

    return new Response(JSON.stringify({ genres: normalized }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
