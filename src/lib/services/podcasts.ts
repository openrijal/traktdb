
import { eq, or, and, desc } from 'drizzle-orm';
import { podcasts, podcastEpisodes } from 'drizzle/schema';
import type { iTunesPodcastItem } from '@/lib/itunes';
import type { ListenNotesPodcast } from '@/lib/listennotes';
import Parser from 'rss-parser';

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

    // Check by listenNotesId OR itunesId to prevent duplicates
    let whereClause;
    if (itunesId) {
        whereClause = or(eq(podcasts.listenNotesId, listenNotesId), eq(podcasts.itunesId, itunesId));
    } else {
        whereClause = eq(podcasts.listenNotesId, listenNotesId);
    }

    const existing = await db.select().from(podcasts).where(whereClause).limit(1);

    const podcastData = {
        listenNotesId: listenNotesId,
        itunesId: itunesId || existing[0]?.itunesId || null,
        collectionName: item.title_original || item.title || 'Unknown Podcast',
        artistName: item.publisher_original || item.publisher || 'Unknown Publisher',
        feedUrl: item.rss || existing[0]?.feedUrl || null, // Capture RSS from ListenNotes
        artworkUrl: item.image || item.thumbnail || null,
        genres: item.genre_ids?.map(id => id.toString()) || [],
        description: item.description_original || item.description || null,
        totalEpisodes: item.total_episodes || null,
        listenScore: typeof item.listen_score === 'number' ? item.listen_score : null,
        updatedAt: new Date(),
    };

    let pId;

    if (existing.length > 0) {
        await db.update(podcasts)
            .set(podcastData)
            .where(eq(podcasts.id, existing[0].id));
        pId = existing[0].id;
    } else {
        const inserted = await db.insert(podcasts).values(podcastData).returning({ id: podcasts.id });
        pId = inserted[0].id;
    }

    // If episodes are provided in the ListenNotes response (e.g. from getPodcast), insert them directly
    if (item.episodes && item.episodes.length > 0) {
        const episodesToInsert = item.episodes.map(ep => ({
            podcastId: pId,
            guid: ep.id, // ListenNotes episode ID as GUID equivalent
            title: ep.title,
            description: ep.description,
            pubDate: ep.pub_date_ms ? new Date(ep.pub_date_ms) : null,
            duration: ep.audio_length_sec ? ep.audio_length_sec.toString() : null,
            audioUrl: ep.audio,
            enclosureLength: null,
            episodeNumber: null, // ListenNotes simplistic episode doesn't always have number readily
            seasonNumber: null,
            updatedAt: new Date(),
        }));

        await db.insert(podcastEpisodes)
            .values(episodesToInsert)
            .onConflictDoUpdate({
                target: [podcastEpisodes.guid, podcastEpisodes.podcastId],
                set: {
                    title: sql`excluded.title`,
                    description: sql`excluded.description`,
                    audioUrl: sql`excluded.audio_url`,
                    updatedAt: new Date(),
                }
            });

        // Mark as refreshed so generic refresh logic skips it (if using RSS parser later)
        await db.update(podcasts).set({ lastRefreshedAt: new Date() }).where(eq(podcasts.id, pId));
    }

    return pId;
};

export const refreshPodcastEpisodes = async (db: any, podcastId: number) => {
    const podcast = await db.query.podcasts.findFirst({
        where: eq(podcasts.id, podcastId),
    });

    if (!podcast || !podcast.feedUrl) {
        console.log(`[Podcasts] No feed URL for podcast ${podcastId}`);
        return;
    }

    // Check if we refreshed recently (e.g., within 1 hour)
    // But verify metadata first - if Unknown, force refresh
    const ONE_HOUR = 60 * 60 * 1000;
    const isUnknown = podcast.collectionName === 'Unknown Podcast';

    if (!isUnknown && podcast.lastRefreshedAt && (Date.now() - new Date(podcast.lastRefreshedAt).getTime() < ONE_HOUR)) {
        console.log(`[Podcasts] Recently refreshed ${podcastId}, skipping.`);
        return;
    }

    console.log(`[Podcasts] Refreshing episodes for ${podcast.collectionName} (${podcastId})`);

    try {
        const parser = new Parser();
        const feed = await parser.parseURL(podcast.feedUrl);

        // Update podcast metadata from feed if missing or if title is generic
        await db.update(podcasts).set({
            collectionName: (podcast.collectionName === 'Unknown Podcast' && feed.title) ? feed.title : undefined,
            description: podcast.description || feed.description,
            artistName: podcast.artistName || feed.itunes?.owner?.name || feed.creator,
            lastRefreshedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(podcasts.id, podcastId));

        const episodesToInsert = [];

        // Process episodes
        for (const item of feed.items) {
            if (!item.guid && !item.link) continue;

            const guid = item.guid || item.link!;

            // Check existence logic could be optimized with onConflictDoUpdate if supported by driver/DDL, 
            // but Drizzle with Postgres usually handles basic conflicts. 
            // We'll trust onConflict in schema if we added unique constraint, 
            // or do a quick check. Schema has `unq: uniqueIndex('podcast_episodes_guid_podcast_unique')`

            // Prepare data
            const duration = item.itunes?.duration || null;
            const episodeNum = item.itunes?.episode ? parseInt(item.itunes.episode) : null;
            const seasonNum = item.itunes?.season ? parseInt(item.itunes.season) : null;
            const enclosure = item.enclosure;

            if (!enclosure?.url) continue;

            episodesToInsert.push({
                podcastId: podcastId,
                guid: guid,
                title: item.title || 'Untitled Episode',
                description: item.contentSnippet || item.content || null,
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                duration: duration,
                audioUrl: enclosure.url,
                enclosureLength: enclosure.length ? parseInt(String(enclosure.length)) : null,
                episodeNumber: episodeNum,
                seasonNumber: seasonNum,
                updatedAt: new Date(),
            });
        }

        // Batch insert with conflict handling
        // Since we might have many episodes, we should loop or batch. 
        // Drizzle `onConflictDoUpdate` is ideal.

        if (episodesToInsert.length > 0) {
            await db.insert(podcastEpisodes)
                .values(episodesToInsert)
                .onConflictDoUpdate({
                    target: [podcastEpisodes.guid, podcastEpisodes.podcastId],
                    set: {
                        title: sql`excluded.title`,
                        description: sql`excluded.description`,
                        audioUrl: sql`excluded.audio_url`,
                        updatedAt: new Date(),
                    }
                });
        }

        console.log(`[Podcasts] Refreshed ${episodesToInsert.length} episodes for ${podcastId}`);

    } catch (e) {
        console.error(`[Podcasts] Failed to parse RSS for ${podcastId}:`, e);
    }
};

import { sql } from 'drizzle-orm';
