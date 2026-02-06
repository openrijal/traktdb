import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContinueSection from './ContinueSection.vue';

// Mock constants
vi.mock('@/lib/constants', () => ({
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    PLACEHOLDER_IMAGE_URL: 'data:image/svg+xml,placeholder'
}));

vi.mock('@/lib/date', () => ({
    formatEpisodeLabel: (s: number, e: number) =>
        `S${String(s).padStart(2, '0')}E${String(e).padStart(2, '0')}`
}));

describe('ContinueSection.vue', () => {
    const mockFetch = vi.fn();

    function mockWatchingResponse(data: any[] = []) {
        return {
            ok: true,
            json: () => Promise.resolve({ success: true, data })
        };
    }

    function mockNextEpisodeResponse(data: Record<number, any> = {}) {
        return {
            ok: true,
            json: () => Promise.resolve({ success: true, data })
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    function setupFetchMock(watchingData: any[] = [], nextEpisodeData: Record<number, any> = {}) {
        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/library/watching') {
                return Promise.resolve(mockWatchingResponse(watchingData));
            }
            if (url === '/api/library/next-episode') {
                return Promise.resolve(mockNextEpisodeResponse(nextEpisodeData));
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });
    }

    it('renders "Continue Watching" heading', async () => {
        setupFetchMock();

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const heading = wrapper.find('h2');
        expect(heading.exists()).toBe(true);
        expect(heading.text()).toBe('Continue Watching');
    });

    it('shows loading skeletons initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

        const wrapper = mount(ContinueSection);
        const skeletons = wrapper.findAll('.animate-pulse');
        expect(skeletons.length).toBe(3);
    });

    it('renders empty state when no watching items', async () => {
        setupFetchMock();

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Start watching shows to see them here.');
        expect(wrapper.find('.border-dashed').exists()).toBe(true);
    });

    it('renders SVG icon in empty state (no Play button)', async () => {
        setupFetchMock();

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const svg = wrapper.find('.border-dashed svg');
        expect(svg.exists()).toBe(true);
    });

    it('renders watching items when data is returned', async () => {
        const mockItems = [
            {
                id: 1, tmdbId: 100, type: 'tv', title: 'Breaking Bad',
                posterPath: '/poster.jpg', backdropPath: '/backdrop.jpg',
                progress: 45, updatedAt: '2025-01-01T00:00:00.000Z'
            },
            {
                id: 2, tmdbId: 200, type: 'tv', title: 'The Office',
                posterPath: '/office.jpg', backdropPath: null,
                progress: 12, updatedAt: '2025-01-02T00:00:00.000Z'
            },
        ];

        setupFetchMock(mockItems);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Breaking Bad');
        expect(wrapper.text()).toContain('The Office');
        expect(wrapper.find('.border-dashed').exists()).toBe(false);
    });

    it('does not render Play button on cards', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Test Show',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const playIcons = wrapper.findAll('[data-testid="play-icon"]');
        expect(playIcons.length).toBe(0);
    });

    it('renders item links with correct href', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Test Show',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const link = wrapper.find('a');
        expect(link.attributes('href')).toBe('/media/tv/100');
    });

    it('renders backdrop images with TMDB base URL', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Show',
            posterPath: '/poster.jpg', backdropPath: '/backdrop.jpg',
            progress: 50, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/backdrop.jpg');
    });

    it('uses poster path as fallback when no backdrop', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Show',
            posterPath: '/poster.jpg', backdropPath: null,
            progress: 0, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
    });

    it('uses placeholder when no image paths', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Show',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('data:image/svg+xml,placeholder');
    });

    it('renders progress bar when progress > 0', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Show',
            posterPath: null, backdropPath: null,
            progress: 45, updatedAt: null
        }]);

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const progressBar = wrapper.find('.bg-primary');
        expect(progressBar.exists()).toBe(true);
        expect(progressBar.attributes('style')).toContain('width: 45%');
    });

    it('shows error message on 401', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Sign in to see your watching list');
    });

    it('shows error message on fetch failure', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Failed to load watching list');
    });

    it('fetches from /api/library/watching on mount', async () => {
        setupFetchMock();

        mount(ContinueSection);
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/library/watching');
    });

    it('shows next episode label when next-episode data is available', async () => {
        const watchingItems = [{
            id: 1, tmdbId: 100, type: 'tv', title: 'Breaking Bad',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }];

        const nextEpisodeData = {
            100: {
                episodeId: 42,
                seasonNumber: 2,
                episodeNumber: 5,
                episodeName: 'Breakage',
                overview: null,
                stillPath: null,
                airDate: null
            }
        };

        setupFetchMock(watchingItems, nextEpisodeData);

        const wrapper = mount(ContinueSection);
        await flushPromises();
        await flushPromises();

        expect(wrapper.text()).toContain('S02E05');
        expect(wrapper.text()).toContain('Breakage');
    });

    it('does not show episode label when next-episode data is null', async () => {
        const watchingItems = [{
            id: 1, tmdbId: 100, type: 'tv', title: 'Breaking Bad',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }];

        setupFetchMock(watchingItems, { 100: null });

        const wrapper = mount(ContinueSection);
        await flushPromises();
        await flushPromises();

        expect(wrapper.text()).toContain('Breaking Bad');
        expect(wrapper.text()).not.toContain('S0');
    });

    it('fetches next-episode data after watching list loads', async () => {
        setupFetchMock([{
            id: 1, tmdbId: 100, type: 'tv', title: 'Test',
            posterPath: null, backdropPath: null,
            progress: 0, updatedAt: null
        }]);

        mount(ContinueSection);
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/library/next-episode');
    });

    it('does not fetch next-episode when watching list is empty', async () => {
        setupFetchMock([]);

        mount(ContinueSection);
        await flushPromises();

        expect(mockFetch).not.toHaveBeenCalledWith('/api/library/next-episode');
    });

    it('still renders cards when next-episode fetch fails', async () => {
        mockFetch.mockImplementation((url: string) => {
            if (url === '/api/library/watching') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        data: [{
                            id: 1, tmdbId: 100, type: 'tv', title: 'Resilient Show',
                            posterPath: null, backdropPath: null,
                            progress: 0, updatedAt: null
                        }]
                    })
                });
            }
            if (url === '/api/library/next-episode') {
                return Promise.reject(new Error('Network error'));
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Resilient Show');
    });
});
