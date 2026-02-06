import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertPodcast, refreshPodcastEpisodes } from './podcasts';

// Mock RSS Parser
// Mock RSS Parser
const mockParseURL = vi.fn();
vi.mock('rss-parser', () => {
    return {
        default: class MockParser {
            parseURL = mockParseURL;
        }
    };
});

describe('Podcast Service', () => {
    const mockDb = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        query: {
            podcasts: {
                findFirst: vi.fn()
            }
        }
    };

    // Helper to chain mock return values
    const createChain = (returnValue: any) => {
        const chain = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue(returnValue),
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue(returnValue),
            set: vi.fn().mockReturnThis(),
            onConflictDoUpdate: vi.fn().mockResolvedValue(returnValue),
        };
        return chain;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb.select.mockReturnValue(createChain([]));
        mockDb.insert.mockReturnValue(createChain([{ id: 1 }]));
        mockDb.update.mockReturnValue(createChain([{ id: 1 }]));
    });

    it('should upsert a podcast from iTunes data', async () => {
        const item = {
            collectionId: 12345,
            collectionName: 'Test Podcast',
            artistName: 'Test Artist',
            feedUrl: 'http://example.com/feed',
            artworkUrl600: 'http://example.com/image.jpg',
            genres: ['News']
        };

        mockDb.select.mockReturnValue(createChain([])); // No existing

        const id = await upsertPodcast(mockDb, item);
        expect(id).toBe(1);
        expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should refresh episodes from RSS feed', async () => {
        const podcast = {
            id: 1,
            feedUrl: 'http://example.com/feed',
            collectionName: 'Test Podcast',
            lastRefreshedAt: null
        };

        mockDb.query.podcasts.findFirst.mockResolvedValue(podcast);

        mockParseURL.mockResolvedValue({
            title: 'Feed Title',
            description: 'Feed Description',
            items: [
                {
                    title: 'Episode 1',
                    guid: 'ep1',
                    pubDate: '2023-01-01T00:00:00Z',
                    enclosure: { url: 'http://example.com/ep1.mp3', length: '12345' },
                    itunes: { duration: '30:00' }
                }
            ]
        });

        await refreshPodcastEpisodes(mockDb, 1);

        expect(mockParseURL).toHaveBeenCalledWith(podcast.feedUrl);
        expect(mockDb.insert).toHaveBeenCalled(); // Inserting episodes
        expect(mockDb.update).toHaveBeenCalled(); // Updating podcast metadata
    });

    it('should upsert podcast from ListenNotes and save episodes', async () => {
        const lnItem = {
            id: 'ln123',
            title_original: 'LN Podcast',
            publisher_original: 'LN Publisher',
            image: 'http://ln.com/img.jpg',
            episodes: [
                {
                    id: 'ep_ln_1',
                    title: 'LN Episode 1',
                    description: 'Desc',
                    pub_date_ms: 1672531200000,
                    audio: 'http://ln.com/audio.mp3',
                    audio_length_sec: 1800,
                    thumbnail: '',
                    maybe_audio_invalid: false,
                    listennotes_url: ''
                }
            ]
        };

        mockDb.select.mockReturnValue(createChain([])); // No existing

        // We need to import upsertPodcastFromListenNotes dynamically or update import at top
        const { upsertPodcastFromListenNotes } = await import('./podcasts');

        const id = await upsertPodcastFromListenNotes(mockDb, lnItem as any);

        expect(id).toBe(1);
        expect(mockDb.insert).toHaveBeenCalledTimes(2); // 1 for podcast, 1 for episodes (batch)
    });
});
