import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TmdbPoster from './TmdbPoster.vue';

describe('TmdbPoster.vue', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    it('fetches poster from media API on mount', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/abc.jpg' })
        });

        mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'tv' }
        });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/media/tv/100');
    });

    it('normalizes show type to tv for API call', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/abc.jpg' })
        });

        mount(TmdbPoster, {
            props: { tmdbId: 50, type: 'show' }
        });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/media/tv/50');
    });

    it('renders image with TMDB URL when poster_path is returned', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/poster123.jpg' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'movie' }
        });
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/poster123.jpg');
    });

    it('does not use loading="lazy" on img (fix #144)', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/poster.jpg' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'movie' }
        });
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('loading')).toBeUndefined();
    });

    it('shows "No Image" when fetch fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 404 });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 999, type: 'movie' }
        });
        await flushPromises();

        expect(wrapper.text()).toContain('No Image');
    });

    it('shows "No Image" when no poster_path in response', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ title: 'Some Movie' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'movie' }
        });
        await flushPromises();

        expect(wrapper.text()).toContain('No Image');
    });

    it('re-fetches when tmdbId prop changes', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/first.jpg' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'tv' }
        });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledTimes(1);

        await wrapper.setProps({ tmdbId: 200 });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith('/api/media/tv/200');
    });

    it('re-fetches when type prop changes', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ poster_path: '/poster.jpg' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'tv' as const }
        });
        await flushPromises();

        await wrapper.setProps({ type: 'movie' });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/media/movie/100');
    });

    it('handles posterPath field (camelCase fallback)', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ posterPath: '/camel.jpg' })
        });

        const wrapper = mount(TmdbPoster, {
            props: { tmdbId: 100, type: 'movie' }
        });
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/camel.jpg');
    });
});
