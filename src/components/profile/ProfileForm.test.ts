import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ProfileForm from './ProfileForm.vue';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/components/profile/AvatarUpload.vue', () => ({
    default: { template: '<div data-testid="avatar-upload"></div>' },
}));

vi.mock('@/components/ui/input', () => ({
    Input: {
        template: '<input :value="modelValue" v-bind="$attrs" />',
        props: ['modelValue'],
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: {
        template: '<button><slot /></button>',
    },
}));

vi.mock('@/lib/auth-client', () => ({
    authClient: {
        updateUser: vi.fn(),
        useSession: vi.fn(),
    },
}));

describe('ProfileForm', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.stubGlobal('fetch', vi.fn((url: string, options?: any) => {
            if (!options || options.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ genres: ['Action'] }),
                } as Response);
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ genres: [] }),
            } as Response);
        }));
    });

    it('hydrates user from initialUser and renders fields', async () => {
        const initialUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            image: 'https://example.com/avatar.png',
        };

        const wrapper = mount(ProfileForm, {
            props: { initialUser },
        });

        const authStore = useAuthStore();
        expect(authStore.user?.name).toBe('Jane Doe');

        const inputs = wrapper.findAll('input');
        const nameInput = inputs.find((i) => i.attributes('id') === 'name');
        const emailInput = inputs.find((i) => i.attributes('id') === 'email');

        expect(nameInput?.element).toBeTruthy();
        expect(emailInput?.element).toBeTruthy();
        expect((nameInput!.element as HTMLInputElement).value).toBe('Jane Doe');
        expect((emailInput!.element as HTMLInputElement).value).toBe('jane@example.com');
    });

    it('loads genres on mount', async () => {
        mount(ProfileForm, { props: { initialUser: { name: 'Test' } } });
        await new Promise((r) => setTimeout(r, 0));
        expect(global.fetch).toHaveBeenCalledWith('/api/profile/genres');
    });

    it('toggles genre selection and updates count', async () => {
        const wrapper = mount(ProfileForm, { props: { initialUser: { name: 'Test' } } });
        await new Promise((r) => setTimeout(r, 0));

        const actionBtn = wrapper.findAll('button').find((b) => b.text() === 'Action');
        const dramaBtn = wrapper.findAll('button').find((b) => b.text() === 'Drama');

        expect(actionBtn).toBeTruthy();
        expect(dramaBtn).toBeTruthy();

        await dramaBtn!.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('2/12 selected');

        await actionBtn!.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('1/12 selected');
    });

    it('caps selection at 12 genres', async () => {
        const wrapper = mount(ProfileForm, { props: { initialUser: { name: 'Test' } } });
        await new Promise((r) => setTimeout(r, 0));

        const genreButtons = wrapper.findAll('button').filter((b) =>
            [
                'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
                'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
                'Romance', 'Sci-Fi', 'Thriller', 'TV Movie', 'War', 'Western'
            ].includes(b.text())
        );

        for (let i = 0; i < 13; i++) {
            await genreButtons[i].trigger('click');
        }
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('12/12 selected');
    });

    it('posts selected genres on save', async () => {
        const fetchMock = vi.fn((url: string, options?: any) => {
            if (!options || options.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ genres: ['Action'] }),
                } as Response);
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ genres: [] }),
            } as Response);
        });
        vi.stubGlobal('fetch', fetchMock);

        const wrapper = mount(ProfileForm, { props: { initialUser: { name: 'Test' } } });
        await new Promise((r) => setTimeout(r, 0));

        const dramaBtn = wrapper.findAll('button').find((b) => b.text() === 'Drama');
        await dramaBtn!.trigger('click');
        await wrapper.vm.$nextTick();

        const saveInterests = wrapper.findAll('button').find((b) => b.text().includes('Save Interests'));
        await saveInterests!.trigger('click');

        const postCall = fetchMock.mock.calls.find((c) => c[0] === '/api/profile/genres' && c[1]?.method === 'POST');
        expect(postCall).toBeTruthy();

        const body = JSON.parse(postCall![1].body);
        expect(body.genres).toEqual(expect.arrayContaining(['Action', 'Drama']));
    });

    it('shows error when interests save fails', async () => {
        const fetchMock = vi.fn((url: string, options?: any) => {
            if (!options || options.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ genres: ['Action'] }),
                } as Response);
            }
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            } as Response);
        });
        vi.stubGlobal('fetch', fetchMock);

        const wrapper = mount(ProfileForm, { props: { initialUser: { name: 'Test' } } });
        await new Promise((r) => setTimeout(r, 0));

        const saveInterests = wrapper.findAll('button').find((b) => b.text().includes('Save Interests'));
        await saveInterests!.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('Failed to save interests.');
    });
});
