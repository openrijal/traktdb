import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import NextEpisodeBanner from './NextEpisodeBanner.vue';

vi.mock('@/lib/constants', () => ({
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
}));

vi.mock('@/lib/date', () => ({
    formatEpisodeLabel: (s: number, e: number) =>
        `S${String(s).padStart(2, '0')}E${String(e).padStart(2, '0')}`
}));

vi.mock('lucide-vue-next', () => ({
    Check: { template: '<span data-testid="check-icon" />' },
    Loader2: { template: '<span data-testid="loader-icon" />' },
}));

describe('NextEpisodeBanner.vue', () => {
    const mockFetch = vi.fn();

    const sampleEpisode = {
        episodeId: 42,
        seasonNumber: 2,
        episodeNumber: 5,
        episodeName: 'Breakage',
        overview: 'Jesse deals with the aftermath.',
        stillPath: '/still.jpg',
        airDate: '2009-04-12',
        voteAverage: 8.5,
    };

    function mockNextEpisodeResponse(data: any = null) {
        return {
            ok: true,
            json: () => Promise.resolve({ success: true, data }),
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    it('renders nothing while loading', () => {
        mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        expect(wrapper.find('section').exists()).toBe(false);
    });

    it('renders nothing when no next episode', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(null));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('section').exists()).toBe(false);
    });

    it('renders banner when next episode data exists', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('section').exists()).toBe(true);
        expect(wrapper.text()).toContain('Breakage');
    });

    it('fetches with correct tmdbId query param', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(null));

        mount(NextEpisodeBanner, { props: { tmdbId: 456 } });
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/library/next-episode?tmdbId=456');
    });

    it('shows episode label badge (S02E05)', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.text()).toContain('S02E05');
    });

    it('shows episode name', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('h3').text()).toBe('Breakage');
    });

    it('shows overview text', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.text()).toContain('Jesse deals with the aftermath.');
    });

    it('hides overview when null', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse({
            ...sampleEpisode, overview: null
        }));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        const paragraphs = wrapper.findAll('p');
        const overviewP = paragraphs.filter(p => p.classes().includes('line-clamp-3'));
        expect(overviewP.length).toBe(0);
    });

    it('shows episode still image with TMDB base URL', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/still.jpg');
    });

    it('shows "No Image" placeholder when stillPath is null', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse({
            ...sampleEpisode, stillPath: null
        }));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('No Image');
    });

    it('shows formatted air date', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        // Compute expected date string the same way the component does
        const expected = new Date('2009-04-12').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
        expect(wrapper.text()).toContain(expected);
    });

    it('hides air date when null', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse({
            ...sampleEpisode, airDate: null
        }));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.text()).not.toContain('2009');
    });

    it('renders "Mark as Watched" button', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.text()).toContain('Mark as Watched');
    });

    it('calls episode-status API on Mark as Watched click', async () => {
        mockFetch
            .mockResolvedValueOnce(mockNextEpisodeResponse(sampleEpisode)) // initial fetch
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // mark watched
            .mockResolvedValueOnce(mockNextEpisodeResponse(null)); // re-fetch returns null

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/library/episode-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ episodeId: 42, watched: true }),
        });
    });

    it('re-fetches next episode after marking watched', async () => {
        const nextEpisode = {
            ...sampleEpisode,
            episodeId: 43,
            episodeNumber: 6,
            episodeName: 'Peekaboo',
        };

        mockFetch
            .mockResolvedValueOnce(mockNextEpisodeResponse(sampleEpisode)) // initial
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // mark
            .mockResolvedValueOnce(mockNextEpisodeResponse(nextEpisode)); // re-fetch

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Peekaboo');
        expect(wrapper.text()).toContain('S02E06');
    });

    it('hides banner when all episodes watched after mark', async () => {
        mockFetch
            .mockResolvedValueOnce(mockNextEpisodeResponse(sampleEpisode))
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
            .mockResolvedValueOnce(mockNextEpisodeResponse(null));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();
        expect(wrapper.find('section').exists()).toBe(true);

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.find('section').exists()).toBe(false);
    });

    it('renders nothing on fetch error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('section').exists()).toBe(false);
    });

    it('shows "Continue Watching" heading', async () => {
        mockFetch.mockResolvedValue(mockNextEpisodeResponse(sampleEpisode));

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        expect(wrapper.find('h2').text()).toBe('Continue Watching');
    });

    it('disables button while marking', async () => {
        mockFetch
            .mockResolvedValueOnce(mockNextEpisodeResponse(sampleEpisode))
            .mockReturnValueOnce(new Promise(() => {})); // Mark never resolves

        const wrapper = mount(NextEpisodeBanner, { props: { tmdbId: 100 } });
        await flushPromises();

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });
});
