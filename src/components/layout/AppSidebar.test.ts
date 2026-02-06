import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
    LayoutDashboard: { template: '<svg data-testid="icon-dashboard" />' },
    Library: { template: '<svg data-testid="icon-library" />' },
    Settings: { template: '<svg data-testid="icon-settings" />' },
    LogOut: { template: '<svg data-testid="icon-logout" />' },
    Users: { template: '<svg data-testid="icon-users" />' },
    Search: { template: '<svg data-testid="icon-search" />' },
    Book: { template: '<svg data-testid="icon-book" />' },
    Headphones: { template: '<svg data-testid="icon-headphones" />' }
}));

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
    authClient: {
        signOut: vi.fn(),
    },
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
    Button: { template: '<button><slot /></button>' }
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
            props: { currentPath: '/library' }
        });
        expect(wrapper.text()).toContain('Library');
        expect(wrapper.find('a[href="/library"]').exists()).toBe(true);
    });

    it('renders friends link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/friends' }
        });
        expect(wrapper.text()).toContain('Friends');
        expect(wrapper.find('a[href="/friends"]').exists()).toBe(true);
    });

    it('does NOT render settings link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/dashboard' }
        });
        // Settings link was removed from the list
        expect(wrapper.find('a[href="/settings"]').exists()).toBe(false);
    });

    it('does NOT render logout button', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/dashboard' }
        });
        // Logout button was removed
        expect(wrapper.text()).not.toContain('Sign Out');
        expect(wrapper.find('[data-testid="icon-logout"]').exists()).toBe(false);
    });

    it('highlights active link', () => {
        const wrapper = mount(AppSidebar, {
            props: { currentPath: '/dashboard' }
        });

        const nav = wrapper.find('nav');
        const dashboardLink = nav.find('a[href="/dashboard"]');

        expect(dashboardLink.classes()).toContain('bg-primary/10');
        expect(dashboardLink.classes()).toContain('text-primary');

        const libraryLink = nav.find('a[href="/library"]');
        expect(libraryLink.classes()).not.toContain('bg-primary/10');
    });
});
