
import { eq } from 'drizzle-orm';
import { books } from 'drizzle/schema';
import type { GoogleBookItem } from '@/lib/google-books';

export const upsertBook = async (db: any, item: GoogleBookItem) => {
    if (!item.id || !item.volumeInfo) {
        throw new Error('Invalid book item');
    }

    const { id, volumeInfo, saleInfo } = item;
    
    const existing = await db.select().from(books).where(eq(books.googleId, id)).limit(1);

    const bookData = {
        googleId: id,
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors || [],
        description: volumeInfo.description || '',
        thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
        publishedDate: volumeInfo.publishedDate || null,
        pageCount: volumeInfo.pageCount || null,
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating ? Math.round(volumeInfo.averageRating * 10) : null,
        ratingsCount: volumeInfo.ratingsCount || 0,
        isEbook: saleInfo?.isEbook || false,
        updatedAt: new Date(),
    };

    if (existing.length > 0) {
        await db.update(books)
            .set(bookData)
            .where(eq(books.googleId, id));
        return existing[0].id;
    } else {
        const inserted = await db.insert(books).values(bookData).returning({ id: books.id });
        return inserted[0].id;
    }
};
