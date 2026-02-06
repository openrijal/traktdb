import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OmniSearchPage from './OmniSearchPage.vue';
import { getTestHost } from '@/lib/test-utils';

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
    useDebounceFn: (fn: Function) => fn,
}));

// Mock child components
vi.mock('@/components/media/MediaCard.vue', () => ({
    default: { template: '<div class="mock-media-card" />' },
}));
vi.mock('@/components/books/BookCard.vue', () => ({
    default: { template: '<div class="mock-book-card" />' },
}));
vi.mock('@/components/podcasts/PodcastCard.vue', () => ({
    default: { template: '<div class="mock-podcast-card" />' },
}));
vi.mock('@/components/ui/input', () => ({
    Input: { template: '<input v-bind="$attrs" />' },
}));

const mockOmniResponse = {
    query: 'test',
    movies: [
        { id: 1, title: 'Movie A', image: 'https://img/m.jpg', media_type: 'movie', url: '/media/movie/1', year: '2024', rating: 8 },
    ],
    tv: [
        { id: 2, title: 'Show B', image: 'https://img/t.jpg', media_type: 'tv', url: '/media/tv/2', year: '2023', rating: 7.5 },
    ],
    books: [
        { id: 'b1', title: 'Book C', subtitle: 'Author', image: 'https://img/b.jpg', media_type: 'book', url: '/search?q=test&tab=books', year: '2022' },
    ],
    podcasts: [
        { id: 99, title: 'Podcast D', subtitle: 'Host', image: 'https://img/p.jpg', media_type: 'podcast', url: '/search?q=test&tab=podcasts' },
    ],
    totals: { movies: 1, tv: 1, books: 1, podcasts: 1 },
};

describe('OmniSearchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset location
        Object.defineProperty(window, 'location', {
            value: { search: '', href: `${getTestHost()}/search` },
            writable: true,
        });
        vi.spyOn(window.history, 'replaceState').mockImplementation(() => { });
    });

    it('renders search input and empty state', () => {
        const wrapper = mount(OmniSearchPage);
        expect(wrapper.find('input').exists()).toBe(true);
        expect(wrapper.text()).toContain('Search TracktDB');
    });

    it('does not search for single-character query', async () => {
        const fetchSpy = vi.spyOn(global, 'fetch');
        const wrapper = mount(OmniSearchPage);

        const input = wrapper.find('input');
        await input.setValue('a');
        await input.trigger('input');

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('performs search and shows results on valid query', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOmniResponse),
        } as Response);

        const wrapper = mount(OmniSearchPage);

        const input = wrapper.find('input');
        await input.setValue('test');
        await input.trigger('input');
        // Wait for the async fetch
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));
        await wrapper.vm.$nextTick();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/search/omni?q=test'),
        );
    });

    it('shows tab buttons after search', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOmniResponse),
        } as Response);

        const wrapper = mount(OmniSearchPage);
        const input = wrapper.find('input');
        await input.setValue('test');
        await input.trigger('input');

        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));
        await wrapper.vm.$nextTick();

        const buttons = wrapper.findAll('button');
        const tabLabels = buttons.map((b) => b.text());
        expect(tabLabels).toEqual(expect.arrayContaining(['All', 'Movies', 'TV Shows', 'Books', 'Podcasts']));
    });

    it('reads query from URL on mount', async () => {
        Object.defineProperty(window, 'location', {
            value: { search: '?q=batman&tab=movies', href: `${getTestHost()}/search?q=batman&tab=movies` },
            writable: true,
        });

        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOmniResponse),
        } as Response);

        const wrapper = mount(OmniSearchPage);
        await vi.dynamicImportSettled();
        await new Promise((r) => setTimeout(r, 10));
        await wrapper.vm.$nextTick();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/search/omni?q=batman'),
        );
    });
});
