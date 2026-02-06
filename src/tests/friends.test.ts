
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useFriendStore } from '@/stores/friends';
import FriendsDashboard from '@/components/friends/FriendsDashboard.vue';

// Mock clipboard
vi.mock('@vueuse/core', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useClipboard: () => ({
            copy: vi.fn(),
            copied: { value: false }
        })
    };
});

describe('useFriendStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        global.fetch = vi.fn();
    });

    it('fetches friends correctly', async () => {
        const store = useFriendStore();
        const mockData = {
            friends: [{ id: '1', name: 'Friend 1' }],
            incoming: [],
            outgoing: []
        };

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        await store.fetchFriends();
        expect(store.friends).toHaveLength(1);
        expect(store.friends[0].name).toBe('Friend 1');
    });
});

describe('FriendsDashboard', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        // Mock fetch for the onMounted call
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ friends: [], incoming: [], outgoing: [] })
        });
    });

    it('renders all tabs', () => {
        const wrapper = mount(FriendsDashboard);
        const tabs = wrapper.text();

        expect(tabs).toContain('Friends');
        expect(tabs).toContain('Activity');
        expect(tabs).toContain('Requests');
        expect(tabs).toContain('Find');
        expect(tabs).toContain('Invite');
    });

    it('defaults to list tab', () => {
        const wrapper = mount(FriendsDashboard);
        expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true);
        // "You haven't added any friends yet" should be visible in list tab when empty
        expect(wrapper.text()).toContain("You haven't added any friends yet");
    });
});
