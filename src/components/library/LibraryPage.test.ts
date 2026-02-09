import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LibraryPage from './LibraryPage.vue';
import { MediaType } from '@/lib/constants';
import { getTestHost } from '@/lib/test-utils';

// Mock child components
vi.mock('@/components/media/MediaCard.vue', () => ({
    default: { template: '<div class="mock-media-card" />' },
}));
vi.mock('@/components/books/BookCard.vue', () => ({
    default: { template: '<div class="mock-book-card" />' },
}));
vi.mock('@/components/podcasts/PodcastCard.vue', () => ({
    default: {
        template: '<div class="mock-podcast-card" />',
        props: ['linkPrefix', 'podcast']
    },
}));

const mockMovieItems = {
    items: [
        {
            id: 100,
            title: 'Test Movie',
            poster_path: '/poster.jpg',
            vote_average: 8.5,
            release_date: '2024-01-01',
            media_type: 'movie',
        },
    ],
    type: 'movie',
    status: 'plan_to_watch',
    total: 1,
};

describe('LibraryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'location', {
            value: { search: '', href: `${getTestHost()}/library/movies`, pathname: '/library/movies' },
            writable: true,
        });
        vi.spyOn(window.history, 'replaceState').mockImplementation(() => { });
    });

    it('renders media type tabs', () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [], type: 'movie', total: 0 }),
        } as Response);

        const wrapper = mount(LibraryPage);
        const text = wrapper.text();
        expect(text).toContain('Movies');
        expect(text).toContain('Shows');
        expect(text).toContain('Books');
        expect(text).toContain('E-Books');
        expect(text).toContain('Podcasts');
    });

    it('renders status tabs for movies', () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [], type: 'movie', total: 0 }),
        } as Response);

        const wrapper = mount(LibraryPage);
        const text = wrapper.text();
        expect(text).toContain('Want to Watch');
        expect(text).toContain('Watching');
        expect(text).toContain('Watched');
        expect(text).toContain('Dropped');
    });

    it('fetches library items on mount', async () => {
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockMovieItems),
        } as Response);

        mount(LibraryPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/library/items?type=movie&status=plan_to_watch'),
        );
    });

    it('switches media type on tab click', async () => {
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [], type: 'book', total: 0 }),
        } as Response);

        const wrapper = mount(LibraryPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));

        // Click "Books" tab
        const buttons = wrapper.findAll('button');
        const booksButton = buttons.find((b) => b.text().includes('Books'));
        expect(booksButton).toBeTruthy();
        await booksButton!.trigger('click');

        // Should now show read status tabs
        await wrapper.vm.$nextTick();
        const text = wrapper.text();
        expect(text).toContain('Reading');
        expect(text).toContain('Want to Read');
    });

    it('shows empty state when no items', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [], type: 'movie', total: 0 }),
        } as Response);

        const wrapper = mount(LibraryPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 50));
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('No items found');
    });

    it('reads type/status from URL params on mount', async () => {
        Object.defineProperty(window, 'location', {
            value: { search: '?status=reading', href: `${getTestHost()}/library/books?status=reading`, pathname: '/library/books' },
            writable: true,
        });

        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [], type: 'book', total: 0 }),
        } as Response);

        mount(LibraryPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/library/items?type=book&status=reading'),
        );
    });
    it('passes correct linkPrefix to PodcastCard', async () => {
        Object.defineProperty(window, 'location', {
            value: { pathname: '/library/podcasts' },
            writable: true
        });

        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                items: [{ collectionId: 1, title: 'Test Podcast' }],
                type: 'podcast',
                total: 1
            }),
        } as Response);

        const wrapper = mount(LibraryPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));

        const podcastCard = wrapper.findComponent({ name: 'PodcastCard' });
        expect(podcastCard.exists()).toBe(true);
        expect(podcastCard.props('linkPrefix')).toBe('/library/podcasts');
    });
});
