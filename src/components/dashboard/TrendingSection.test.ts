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

        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ results: mockResults })
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

        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ results: mockResults })
        });

        const wrapper = mount(TrendingSection);
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

    it('uses initialData prop when provided', async () => {
        const initialData = [
            { id: 1, title: 'Pre-loaded', media_type: 'movie', poster_path: '/p.jpg', vote_average: 9.0 },
        ];

        const wrapper = mount(TrendingSection, {
            props: { initialData }
        });
        await flushPromises();

        expect(mockFetch).not.toHaveBeenCalled();
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
});
