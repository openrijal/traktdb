
import type { APIRoute } from 'astro';
import { createGoogleBooks } from '@/lib/google-books';
import { createDb } from '@/lib/db';
import { upsertBook } from '@/lib/services/books';

export const GET: APIRoute = async ({ request, locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const db = createDb(env);
    const googleBooks = createGoogleBooks(env);

    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const startIndex = url.searchParams.get('startIndex') || '0';

    if (!q) {
        return new Response(JSON.stringify({ error: 'Query parameter "q" is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const searchResults = await googleBooks.search(q, parseInt(startIndex));
        const validResults = searchResults.items || [];

        if (validResults.length > 0) {
            await Promise.all(validResults.map(book => upsertBook(db, book).catch(e => console.error('Failed to upsert book:', e))));
        }

        return new Response(JSON.stringify(searchResults), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Book Search API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
