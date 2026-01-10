import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MediaCard from './MediaCard.vue';

// Mock fetch to prevent network requests from store
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MediaCard.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({})
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const defaultMedia = {
        id: 123,
        title: 'Test Movie', // mapped from title/name
        poster_path: '/path/to/poster.jpg',
        vote_average: 8.5,
        media_type: 'movie'
    };

    it('renders title and rating correctly', () => {
        const wrapper = mount(MediaCard, {
            props: {
                media: defaultMedia
            }
        });

        expect(wrapper.text()).toContain('Test Movie');
        expect(wrapper.text()).toContain('8.5');
    });

    it('generates correct link for movie', async () => {
        const wrapper = mount(MediaCard, {
            props: {
                media: defaultMedia
            }
        });

        const link = wrapper.find('a');
        // The component likely uses /media/[type]/[id] where id is the TMDb ID.
        // In the prop we passed id: 123. If the component uses id as tmdbId, then:
        expect(link.attributes('href')).toBe('/media/movie/123');
    });

    it('generates correct link for tv show', async () => {
        const wrapper = mount(MediaCard, {
            props: {
                media: {
                    ...defaultMedia,
                    media_type: 'tv',
                    name: 'Test TV' // TV shows might use name
                }
            }
        });

        const link = wrapper.find('a');
        expect(link.attributes('href')).toBe('/media/tv/123');
    });

    it('uses placeholder image when poster_path is missing', () => {
        const wrapper = mount(MediaCard, {
            props: {
                media: {
                    ...defaultMedia,
                    poster_path: null
                }
            }
        });

        const img = wrapper.find('img');
        expect(img.attributes('src')).not.toBeUndefined();
    });
});
