
import { eq, or } from 'drizzle-orm';
import { podcasts } from 'drizzle/schema';
import type { iTunesPodcastItem } from '@/lib/itunes';
import type { ListenNotesPodcast } from '@/lib/listennotes';

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

export const upsertPodcastFromListenNotes = async (db: any, item: ListenNotesPodcast) => {
    if (!item.id) {
        throw new Error('Invalid podcast item - missing Listen Notes ID');
    }

    const listenNotesId = item.id;
    const itunesId = item.itunes_id?.toString() || null;
    
    const whereClause = itunesId 
        ? or(eq(podcasts.listenNotesId, listenNotesId), eq(podcasts.itunesId, itunesId))
        : eq(podcasts.listenNotesId, listenNotesId);
    
    const existing = await db.select().from(podcasts).where(whereClause).limit(1);

    const podcastData = {
        listenNotesId: listenNotesId,
        itunesId: itunesId || existing[0]?.itunesId || null,
        collectionName: item.title_original || 'Unknown Podcast',
        artistName: item.publisher_original || 'Unknown Publisher',
        feedUrl: null,
        artworkUrl: item.image || item.thumbnail || null,
        genres: item.genre_ids?.map(id => id.toString()) || [],
        description: item.description_original || null,
        totalEpisodes: item.total_episodes || null,
        listenScore: typeof item.listen_score === 'number' ? item.listen_score : null,
        updatedAt: new Date(),
    };

    if (existing.length > 0) {
        await db.update(podcasts)
            .set(podcastData)
            .where(eq(podcasts.id, existing[0].id));
        return existing[0].id;
    } else {
        const inserted = await db.insert(podcasts).values(podcastData).returning({ id: podcasts.id });
        return inserted[0].id;
    }
};
