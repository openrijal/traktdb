import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
    LayoutDashboard: { template: '<svg data-testid="icon-dashboard" />' },
    Library: { template: '<svg data-testid="icon-library" />' },
    Users: { template: '<svg data-testid="icon-users" />' },
    Book: { template: '<svg data-testid="icon-book" />' },
    Headphones: { template: '<svg data-testid="icon-headphones" />' },
    Clapperboard: { template: '<svg data-testid="icon-clapperboard" />' },
    Tv: { template: '<svg data-testid="icon-tv" />' },
    Tablet: { template: '<svg data-testid="icon-tablet" />' },
    ChevronDown: { template: '<svg data-testid="icon-chevron" />' },
}));

describe('AppSidebar', () => {
    it('renders dashboard link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/dashboard' }
        });
        expect(wrapper.text()).toContain('Dashboard');
        expect(wrapper.find('a[href="/dashboard"]').exists()).toBe(true);
    });

    it('renders library link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/library/movies' }
        });
        expect(wrapper.text()).toContain('Library');
        expect(wrapper.find('a[href="/library/movies"]').exists()).toBe(true);
    });

    it('renders friends link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/friends' }
        });
        expect(wrapper.text()).toContain('Friends');
        expect(wrapper.find('a[href="/friends"]').exists()).toBe(true);
    });

    it('highlights active link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/dashboard' }
        });

        const nav = wrapper.find('nav');
        const dashboardLink = nav.find('a[href="/dashboard"]');

        expect(dashboardLink.classes()).toContain('bg-primary/10');
        expect(dashboardLink.classes()).toContain('text-primary');

        const libraryLink = nav.find('a[href="/library/movies"]');
        expect(libraryLink.classes()).not.toContain('bg-primary/10');
    });

    it('renders library sub-menu items', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/library/movies' }
        });

        expect(wrapper.find('a[href="/library/movies"]').exists()).toBe(true);
        expect(wrapper.find('a[href="/library/shows"]').exists()).toBe(true);
        expect(wrapper.find('a[href="/library/podcasts"]').exists()).toBe(true);
        expect(wrapper.find('a[href="/library/books"]').exists()).toBe(true);
        expect(wrapper.find('a[href="/library/ebooks"]').exists()).toBe(true);
    });
});
