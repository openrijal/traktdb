import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from './AppHeader.vue';

// Mock child components
vi.mock('@/components/search/GlobalSearch.vue', () => ({
    default: { template: '<div data-testid="global-search"></div>' }
}));

vi.mock('@/components/ui/ThemeToggle.vue', () => ({
    default: { template: '<div data-testid="theme-toggle"></div>' }
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: { template: '<div class="avatar"><slot /></div>', props: ['class'] },
    AvatarFallback: { template: '<div class="avatar-fallback"><slot /></div>', props: ['class'] },
    AvatarImage: { template: '<img class="avatar-image" />', props: ['src', 'alt'] }
}));

vi.mock('lucide-vue-next', () => ({
    UserCircle: { template: '<svg data-testid="user-circle-icon" />' }
}));

describe('AppHeader.vue', () => {
    it('renders with bottom border (fix #132)', () => {
        const wrapper = mount(AppHeader);
        const header = wrapper.find('header');
        expect(header.classes()).toContain('border-b');
    });

    it('renders border with correct border-border/50 class', () => {
        const wrapper = mount(AppHeader);
        const header = wrapper.find('header');
        // Check the raw class attribute contains border-border/50
        expect(header.attributes('class')).toContain('border-border/50');
    });

    it('renders user name when user prop provided', () => {
        const wrapper = mount(AppHeader, {
            props: { user: { name: 'Test User', image: null } }
        });
        expect(wrapper.text()).toContain('Test User');
    });

    it('renders fallback "User" when no user name', () => {
        const wrapper = mount(AppHeader, {
            props: { user: { name: null, image: null } }
        });
        expect(wrapper.text()).toContain('User');
    });

    it('renders fallback "User" when no user prop', () => {
        const wrapper = mount(AppHeader);
        expect(wrapper.text()).toContain('User');
    });

    it('renders GlobalSearch component', () => {
        const wrapper = mount(AppHeader);
        expect(wrapper.find('[data-testid="global-search"]').exists()).toBe(true);
    });

    it('renders ThemeToggle component', () => {
        const wrapper = mount(AppHeader);
        expect(wrapper.find('[data-testid="theme-toggle"]').exists()).toBe(true);
    });

    it('renders avatar', () => {
        const wrapper = mount(AppHeader);
        expect(wrapper.find('.avatar').exists()).toBe(true);
    });

    it('shows avatar image when user has image', () => {
        const wrapper = mount(AppHeader, {
            props: { user: { name: 'Test', image: 'https://example.com/avatar.jpg' } }
        });
        expect(wrapper.find('.avatar-image').exists()).toBe(true);
    });

    it('shows avatar fallback icon when no user image', () => {
        const wrapper = mount(AppHeader, {
            props: { user: { name: 'Test', image: null } }
        });
        expect(wrapper.find('[data-testid="user-circle-icon"]').exists()).toBe(true);
    });
});
