import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserMenu from './UserMenu.vue';

const { mockSignOut } = vi.hoisted(() => {
    const mockSignOut = vi.fn().mockResolvedValue({});
    return { mockSignOut };
});

// Mock radix-vue dropdown components
vi.mock('radix-vue', () => ({
    DropdownMenuRoot: {
        template: '<div data-testid="dropdown-root"><slot /></div>',
        props: ['open', 'defaultOpen'],
    },
    DropdownMenuTrigger: {
        template: '<div data-testid="dropdown-trigger" @click="$emit(\'click\')"><slot /></div>',
        props: ['asChild'],
    },
    DropdownMenuPortal: {
        template: '<div data-testid="dropdown-portal"><slot /></div>',
    },
    DropdownMenuContent: {
        template: '<div data-testid="dropdown-content"><slot /></div>',
        props: ['sideOffset', 'align', 'class'],
    },
    DropdownMenuItem: {
        template: '<div data-testid="dropdown-item" :class="$attrs.class" @click="$emit(\'click\')"><slot /></div>',
        props: ['disabled', 'class', 'as'],
    },
    DropdownMenuSeparator: {
        template: '<hr data-testid="dropdown-separator" />',
        props: ['class'],
    },
    DropdownMenuLabel: {
        template: '<div data-testid="dropdown-label"><slot /></div>',
        props: ['class'],
    },
    AvatarRoot: {
        template: '<div data-testid="avatar-root"><slot /></div>',
        props: ['class'],
    },
    AvatarImage: {
        template: '<img data-testid="avatar-image" :src="src" :alt="alt" />',
        props: ['src', 'alt', 'class'],
    },
    AvatarFallback: {
        template: '<div data-testid="avatar-fallback"><slot /></div>',
        props: ['class', 'delayMs'],
    },
}));

vi.mock('lucide-vue-next', () => ({
    User: { template: '<svg data-testid="icon-user" />' },
    Settings: { template: '<svg data-testid="icon-settings" />' },
    LogOut: { template: '<svg data-testid="icon-logout" />' },
}));

vi.mock('@/lib/auth-client', () => ({
    authClient: {
        signOut: mockSignOut,
    },
}));

describe('UserMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders avatar with user image when provided', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: 'John Doe',
                    image: 'https://example.com/avatar.jpg',
                    email: 'john@example.com',
                },
            },
        });

        const img = wrapper.find('[data-testid="avatar-image"]');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('https://example.com/avatar.jpg');
    });

    it('renders initials fallback when no image is provided', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: 'John Doe',
                    image: null,
                    email: 'john@example.com',
                },
            },
        });

        const fallback = wrapper.find('[data-testid="avatar-fallback"]');
        expect(fallback.exists()).toBe(true);
        expect(fallback.text()).toContain('JD');
    });

    it('renders single initial for single-word name', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: 'John',
                    image: null,
                    email: 'john@example.com',
                },
            },
        });

        const fallback = wrapper.find('[data-testid="avatar-fallback"]');
        expect(fallback.text()).toContain('J');
    });

    it('renders User icon fallback when no name and no image', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: null,
                    image: null,
                    email: 'anon@example.com',
                },
            },
        });

        expect(wrapper.find('[data-testid="icon-user"]').exists()).toBe(true);
    });

    it('renders User icon when user prop is undefined', () => {
        const wrapper = mount(UserMenu, {
            props: {},
        });

        expect(wrapper.find('[data-testid="icon-user"]').exists()).toBe(true);
    });

    it('displays user name and email in dropdown label', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: 'Jane Smith',
                    image: null,
                    email: 'jane@example.com',
                },
            },
        });

        const label = wrapper.find('[data-testid="dropdown-label"]');
        expect(label.text()).toContain('Jane Smith');
        expect(label.text()).toContain('jane@example.com');
    });

    it('displays "User" when name is null', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: null,
                    image: null,
                    email: 'anon@example.com',
                },
            },
        });

        const label = wrapper.find('[data-testid="dropdown-label"]');
        expect(label.text()).toContain('User');
    });

    it('contains Profile menu item', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const items = wrapper.findAll('[data-testid="dropdown-item"]');
        const profileItem = items.find((item) => item.text().includes('Profile'));
        expect(profileItem).toBeTruthy();
    });

    it('contains Settings menu item', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const items = wrapper.findAll('[data-testid="dropdown-item"]');
        const settingsItem = items.find((item) => item.text().includes('Settings'));
        expect(settingsItem).toBeTruthy();
    });

    it('contains Log out menu item', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const items = wrapper.findAll('[data-testid="dropdown-item"]');
        const logoutItem = items.find((item) => item.text().includes('Log out'));
        expect(logoutItem).toBeTruthy();
    });

    it('calls signOut when Log out is clicked', async () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const items = wrapper.findAll('[data-testid="dropdown-item"]');
        const logoutItem = items.find((item) => item.text().includes('Log out'));
        await logoutItem!.trigger('click');
        await flushPromises();

        expect(mockSignOut).toHaveBeenCalled();
    });

    it('has accessible trigger button with aria-label', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const button = wrapper.find('button[aria-label="User menu"]');
        expect(button.exists()).toBe(true);
    });

    it('handles three-word names with two initials', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: {
                    name: 'John Michael Doe',
                    image: null,
                    email: 'jmd@example.com',
                },
            },
        });

        const fallback = wrapper.find('[data-testid="avatar-fallback"]');
        expect(fallback.text()).toContain('JM');
    });

    it('renders separators between menu sections', () => {
        const wrapper = mount(UserMenu, {
            props: {
                user: { name: 'Test', image: null, email: 'test@test.com' },
            },
        });

        const separators = wrapper.findAll('[data-testid="dropdown-separator"]');
        expect(separators.length).toBe(2);
    });
});
