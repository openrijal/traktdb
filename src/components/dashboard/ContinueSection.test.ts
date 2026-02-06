import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContinueSection from './ContinueSection.vue';

// No lucide icons needed after removing Play button

// Mock constants
vi.mock('@/lib/constants', () => ({
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    PLACEHOLDER_IMAGE_URL: 'data:image/svg+xml,placeholder'
}));

describe('ContinueSection.vue', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    it('renders "Continue Watching" heading', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
        });

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
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Start watching shows to see them here.');
        expect(wrapper.find('.border-dashed').exists()).toBe(true);
    });

    it('renders SVG icon in empty state (no Play button)', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
        });

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

        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockItems })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        expect(wrapper.text()).toContain('Breaking Bad');
        expect(wrapper.text()).toContain('The Office');
        expect(wrapper.find('.border-dashed').exists()).toBe(false);
    });

    it('does not render Play button on cards', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Test Show',
                    posterPath: null, backdropPath: null,
                    progress: 0, updatedAt: null
                }]
            })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        // No Play icon should exist on cards (it was removed)
        const playIcons = wrapper.findAll('[data-testid="play-icon"]');
        expect(playIcons.length).toBe(0);
    });

    it('renders item links with correct href', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Test Show',
                    posterPath: null, backdropPath: null,
                    progress: 0, updatedAt: null
                }]
            })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const link = wrapper.find('a');
        expect(link.attributes('href')).toBe('/media/tv/100');
    });

    it('renders backdrop images with TMDB base URL', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Show',
                    posterPath: '/poster.jpg', backdropPath: '/backdrop.jpg',
                    progress: 50, updatedAt: null
                }]
            })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/backdrop.jpg');
    });

    it('uses poster path as fallback when no backdrop', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Show',
                    posterPath: '/poster.jpg', backdropPath: null,
                    progress: 0, updatedAt: null
                }]
            })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
    });

    it('uses placeholder when no image paths', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Show',
                    posterPath: null, backdropPath: null,
                    progress: 0, updatedAt: null
                }]
            })
        });

        const wrapper = mount(ContinueSection);
        await flushPromises();

        const img = wrapper.find('img');
        expect(img.attributes('src')).toBe('data:image/svg+xml,placeholder');
    });

    it('renders progress bar when progress > 0', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                data: [{
                    id: 1, tmdbId: 100, type: 'tv', title: 'Show',
                    posterPath: null, backdropPath: null,
                    progress: 45, updatedAt: null
                }]
            })
        });

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
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
        });

        mount(ContinueSection);
        await flushPromises();

        expect(mockFetch).toHaveBeenCalledWith('/api/library/watching');
    });
});
