
import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { books, userBookProgress } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { createGoogleBooks } from '@/lib/google-books';
import { upsertBook } from '@/lib/services/books';

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
    const googleId = url.searchParams.get('googleId');

    if (!googleId) {
        return new Response(JSON.stringify({ error: 'Missing googleId' }), { status: 400 });
    }

    try {
        const book = await db.select({ id: books.id })
            .from(books)
            .where(eq(books.googleId, googleId))
            .limit(1);

        if (book.length === 0) {
            return new Response(JSON.stringify({ status: null }), { status: 200 });
        }

        const progress = await db.select()
            .from(userBookProgress)
            .where(and(
                eq(userBookProgress.userId, session.user.id),
                eq(userBookProgress.bookId, book[0].id)
            ))
            .limit(1);

        return new Response(JSON.stringify({
            status: progress.length > 0 ? progress[0].status : null,
            progress: progress.length > 0 ? progress[0].progress : 0,
            updatedAt: progress.length > 0 ? progress[0].updatedAt : null,
        }), { status: 200 });

    } catch (error) {
        console.error('Book Status GET Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);
    const googleBooks = createGoogleBooks(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { googleId, status, progress } = body;

        if (!googleId || !status) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        let bookId: number | undefined;
        const existing = await db.select({ id: books.id }).from(books)
            .where(eq(books.googleId, googleId))
            .limit(1);

        if (existing.length > 0) {
            bookId = existing[0].id;
        } else {
            const bookItem = await googleBooks.getBook(googleId);
            bookId = await upsertBook(db, bookItem);
        }

        if (!bookId) {
            throw new Error('Failed to retrieve or create book');
        }

        await db.insert(userBookProgress)
            .values({
                userId: session.user.id,
                bookId: bookId,
                status: status,
                progress: progress || 0,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userBookProgress.userId, userBookProgress.bookId],
                set: {
                    status: status,
                    progress: progress || 0,
                    updatedAt: new Date(),
                }
            });

        return new Response(JSON.stringify({ success: true, status }), { status: 200 });

    } catch (error) {
        console.error('Book Status POST Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
