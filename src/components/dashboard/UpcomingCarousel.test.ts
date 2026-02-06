import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UpcomingCarousel from './UpcomingCarousel.vue';

// Mock child components and icons
vi.mock('@/components/common/TmdbPoster.vue', () => ({
    default: {
        template: '<div data-testid="tmdb-poster"></div>',
        props: ['tmdbId', 'type']
    }
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: {
        template: '<span><slot /></span>',
        props: ['variant', 'class']
    }
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: {
        template: '<div data-testid="dialog" :data-open="open"><slot /></div>',
        props: ['open']
    },
    DialogContent: {
        template: '<div data-testid="dialog-content"><slot /></div>',
        props: ['class']
    },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<h2 data-testid="dialog-title"><slot /></h2>' },
    DialogDescription: { template: '<p data-testid="dialog-description"><slot /></p>' },
}));

vi.mock('lucide-vue-next', () => ({
    ChevronRight: { template: '<svg data-testid="chevron-icon" />' },
    Calendar: { template: '<svg data-testid="calendar-icon" />' }
}));

vi.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

describe('UpcomingCarousel.vue', () => {
    describe('empty state', () => {
        it('does not render duplicate heading (fix #130)', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: false }
            });
            const headings = wrapper.findAll('h2');
            expect(headings.length).toBe(0);
        });

        it('renders Calendar icon in empty state (fix #135)', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: false }
            });
            const icon = wrapper.find('[data-testid="calendar-icon"]');
            expect(icon.exists()).toBe(true);
        });

        it('shows empty state message', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: false }
            });
            expect(wrapper.text()).toContain('No upcoming releases found.');
        });

        it('renders dashed border empty container', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: false }
            });
            const container = wrapper.find('.border-dashed');
            expect(container.exists()).toBe(true);
        });
    });

    describe('loading state', () => {
        it('shows skeleton loaders when loading', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: true }
            });
            const skeletons = wrapper.findAll('.animate-pulse');
            expect(skeletons.length).toBe(4);
        });

        it('does not show empty state while loading', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [], loading: true }
            });
            expect(wrapper.text()).not.toContain('No upcoming releases found.');
        });
    });

    describe('with data', () => {
        const mockMovieItem = {
            type: 'movie',
            title: 'Test Movie',
            date: '2025-03-15',
            ids: { tmdb: 12345 }
        };

        const mockShowItem = {
            type: 'show',
            title: 'Test Show',
            date: '2025-03-16',
            ids: { tmdb: 67890 }
        };

        it('renders movie items', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockMovieItem], loading: false }
            });
            expect(wrapper.text()).toContain('Test Movie');
        });

        it('renders show items', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockShowItem], loading: false }
            });
            expect(wrapper.text()).toContain('Test Show');
        });

        it('groups episodes by show', () => {
            const episodes = [
                { type: 'show', title: 'Same Show', date: '2025-03-15', ids: { tmdb: 111 } },
                { type: 'show', title: 'Same Show', date: '2025-03-16', ids: { tmdb: 111 } },
            ];
            const wrapper = mount(UpcomingCarousel, {
                props: { items: episodes, loading: false }
            });
            // Should have 1 group, not 2
            const groups = wrapper.findAll('.snap-start');
            expect(groups.length).toBe(1);
        });

        it('shows episode count badge for grouped shows', () => {
            const episodes = [
                { type: 'show', title: 'Show', date: '2025-03-15', ids: { tmdb: 111 } },
                { type: 'show', title: 'Show', date: '2025-03-16', ids: { tmdb: 111 } },
            ];
            const wrapper = mount(UpcomingCarousel, {
                props: { items: episodes, loading: false }
            });
            expect(wrapper.text()).toContain('2 Eps');
        });

        it('shows Movie badge for movie items', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockMovieItem], loading: false }
            });
            expect(wrapper.text()).toContain('Movie');
        });

        it('sorts items by date', () => {
            const items = [
                { type: 'movie', title: 'Later Movie', date: '2025-04-01', ids: { tmdb: 2 } },
                { type: 'movie', title: 'Earlier Movie', date: '2025-03-01', ids: { tmdb: 1 } },
            ];
            const wrapper = mount(UpcomingCarousel, {
                props: { items, loading: false }
            });
            const titles = wrapper.findAll('h3');
            expect(titles[0].text()).toBe('Earlier Movie');
            expect(titles[1].text()).toBe('Later Movie');
        });

        it('renders TmdbPoster for each group', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockMovieItem], loading: false }
            });
            const posters = wrapper.findAll('[data-testid="tmdb-poster"]');
            expect(posters.length).toBe(1);
        });

        it('uses hover:-translate-y-1 (consistent with MediaCard)', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockMovieItem], loading: false }
            });
            const card = wrapper.find('.snap-start');
            expect(card.classes()).toContain('motion-safe:hover:-translate-y-1');
        });

        it('uses line-clamp-1 for title (consistent with MediaCard)', () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: [mockMovieItem], loading: false }
            });
            const title = wrapper.find('h3');
            expect(title.classes()).toContain('line-clamp-1');
        });
    });

    describe('dialog interaction', () => {
        const mockShowWithEpisodes = [
            {
                type: 'show', title: 'Breaking Bad', date: '2025-03-15',
                ids: { tmdb: 100 }, episodeTitle: 'Pilot', season: 1, number: 1,
                overview: 'A chemistry teacher starts making meth', runtime: 60
            },
            {
                type: 'show', title: 'Breaking Bad', date: '2025-03-22',
                ids: { tmdb: 100 }, episodeTitle: 'Cat\'s in the Bag', season: 1, number: 2,
                overview: 'Walt and Jesse deal with aftermath', runtime: 60
            },
        ];

        it('opens dialog when clicking a carousel item', async () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: mockShowWithEpisodes, loading: false }
            });

            const card = wrapper.find('.snap-start');
            await card.trigger('click');

            const dialog = wrapper.find('[data-testid="dialog"]');
            expect(dialog.attributes('data-open')).toBe('true');
        });

        it('shows episode details in dialog for shows', async () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: mockShowWithEpisodes, loading: false }
            });

            await wrapper.find('.snap-start').trigger('click');

            expect(wrapper.text()).toContain('Breaking Bad');
            expect(wrapper.text()).toContain('Pilot');
            expect(wrapper.text()).toContain('S01E01');
            expect(wrapper.text()).toContain('S01E02');
            expect(wrapper.text()).toContain('2 upcoming episodes');
        });

        it('shows movie details in dialog', async () => {
            const movieItem = {
                type: 'movie', title: 'Test Movie', date: '2025-03-15',
                ids: { tmdb: 555 }, overview: 'A test movie plot', runtime: 120, rating: 7.5
            };

            const wrapper = mount(UpcomingCarousel, {
                props: { items: [movieItem], loading: false }
            });

            await wrapper.find('.snap-start').trigger('click');

            expect(wrapper.text()).toContain('Test Movie');
            expect(wrapper.text()).toContain('A test movie plot');
            expect(wrapper.text()).toContain('2h 0m');
            expect(wrapper.text()).toContain('7.5 / 10');
        });

        it('shows "View Full Details" link with correct URL', async () => {
            const wrapper = mount(UpcomingCarousel, {
                props: { items: mockShowWithEpisodes, loading: false }
            });

            await wrapper.find('.snap-start').trigger('click');

            const link = wrapper.find('a[href*="/media/"]');
            expect(link.exists()).toBe(true);
            expect(link.attributes('href')).toBe('/media/tv/100');
        });
    });
});
