
import { eq } from 'drizzle-orm';
import { podcasts } from 'drizzle/schema';
import type { iTunesPodcastItem } from '@/lib/itunes';

export const upsertPodcast = async (db: any, item: iTunesPodcastItem) => {
    if (!item.collectionId) {
        throw new Error('Invalid podcast item');
    }

    const itunesId = item.collectionId.toString();
    
    const existing = await db.select().from(podcasts).where(eq(podcasts.itunesId, itunesId)).limit(1);

    const podcastData = {
        itunesId: itunesId,
        collectionName: item.collectionName || 'Unknown Podcast',
        artistName: item.artistName || 'Unknown Artist',
        feedUrl: item.feedUrl || null,
        artworkUrl: item.artworkUrl600 || item.artworkUrl100 || null,
        genres: item.genres || [],
        updatedAt: new Date(),
    };

    if (existing.length > 0) {
        await db.update(podcasts)
            .set(podcastData)
            .where(eq(podcasts.itunesId, itunesId));
        return existing[0].id;
    } else {
        const inserted = await db.insert(podcasts).values(podcastData).returning({ id: podcasts.id });
        return inserted[0].id;
    }
};
