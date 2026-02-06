import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TrendingSection from './TrendingSection.vue';

// Mock MediaCard component
vi.mock('@/components/media/MediaCard.vue', () => ({
    default: {
        template: '<div data-testid="media-card" :data-title="media.title">{{ media.title }}</div>',
        props: ['media', 'type']
    }
}));

vi.mock('lucide-vue-next', () => ({
    Loader2: { template: '<svg data-testid="loader-icon" class="animate-spin" />' }
}));

vi.mock('@/lib/constants', () => ({
    MediaType: { MOVIE: 'movie', TV: 'tv' },
    WatchStatus: {
        PLAN_TO_WATCH: 'plan_to_watch',
        COMPLETED: 'completed',
        WATCHING: 'watching',
        DROPPED: 'dropped',
    }
}));

describe('TrendingSection.vue', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    it('renders "Trending Now" heading', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ results: [] })
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();

        const heading = wrapper.find('h2');
        expect(heading.exists()).toBe(true);
        expect(heading.text()).toBe('Trending Now');
    });

    it('shows loading spinner while fetching', () => {
        // Don't resolve fetch immediately
        mockFetch.mockReturnValue(new Promise(() => {}));

        const wrapper = mount(TrendingSection);
        expect(wrapper.find('[data-testid="loader-icon"]').exists()).toBe(true);
    });

    it('renders media cards on successful fetch', async () => {
        const mockResults = [
            { id: 1, title: 'Movie 1', media_type: 'movie', poster_path: '/p1.jpg', vote_average: 7.5 },
            { id: 2, title: 'Show 1', media_type: 'tv', poster_path: '/p2.jpg', vote_average: 8.0 },
        ];

        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/media/trending') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ results: mockResults })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: null })
            });
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();

        const cards = wrapper.findAll('[data-testid="media-card"]');
        expect(cards.length).toBe(2);
    });

    it('limits displayed items to 12', async () => {
        const mockResults = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            title: `Item ${i}`,
            media_type: 'movie',
            poster_path: `/p${i}.jpg`,
            vote_average: 5 + Math.random() * 5
        }));

        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/media/trending') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ results: mockResults })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: null })
            });
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();
        await flushPromises();

        const cards = wrapper.findAll('[data-testid="media-card"]');
        expect(cards.length).toBe(12);
    });

    it('shows error message on fetch failure', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Failed to load trending content');
    });

    it('shows error message on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const wrapper = mount(TrendingSection);
        await flushPromises();

        expect(wrapper.text()).toContain('An error occurred');
    });

    it('uses initialData prop when provided (skips trending fetch)', async () => {
        const initialData = [
            { id: 1, title: 'Pre-loaded', media_type: 'movie', poster_path: '/p.jpg', vote_average: 9.0 },
        ];

        // Status check calls will happen via fetchStatuses
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: null })
        });

        const wrapper = mount(TrendingSection, {
            props: { initialData }
        });
        await flushPromises();

        // Should not fetch trending API, but may fetch library statuses
        expect(mockFetch).not.toHaveBeenCalledWith('/api/media/trending');
        expect(wrapper.text()).toContain('Pre-loaded');
    });

    it('uses 6-column grid layout', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ results: [{ id: 1, title: 'Test', media_type: 'movie', poster_path: '/p.jpg', vote_average: 7 }] })
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();

        const grid = wrapper.find('.grid');
        expect(grid.classes()).toContain('lg:grid-cols-6');
    });

    it('filters out watched/watching/dropped items after status fetch', async () => {
        const mockResults = [
            { id: 1, title: 'Unwatched Movie', media_type: 'movie', poster_path: '/p1.jpg', vote_average: 7 },
            { id: 2, title: 'Watched Movie', media_type: 'movie', poster_path: '/p2.jpg', vote_average: 8 },
            { id: 3, title: 'Watching Show', media_type: 'tv', poster_path: '/p3.jpg', vote_average: 6 },
        ];

        // First call: trending API; subsequent calls: library status
        let callCount = 0;
        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/media/trending') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ results: mockResults })
                });
            }
            // Status calls
            if (url.includes('tmdbId=2')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ status: 'completed' })
                });
            }
            if (url.includes('tmdbId=3')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ status: 'watching' })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: null })
            });
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();
        // Wait for status fetches
        await flushPromises();

        const cards = wrapper.findAll('[data-testid="media-card"]');
        expect(cards.length).toBe(1);
        expect(cards[0].text()).toContain('Unwatched Movie');
    });

    it('keeps plan_to_watch items in trending', async () => {
        const mockResults = [
            { id: 1, title: 'Plan to Watch', media_type: 'movie', poster_path: '/p.jpg', vote_average: 7 },
        ];

        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/media/trending') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ results: mockResults })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: 'plan_to_watch' })
            });
        });

        const wrapper = mount(TrendingSection);
        await flushPromises();
        await flushPromises();

        const cards = wrapper.findAll('[data-testid="media-card"]');
        expect(cards.length).toBe(1);
        expect(cards[0].text()).toContain('Plan to Watch');
    });
});
