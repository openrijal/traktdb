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
    });

    it('hydrates user from initialUser prop and shows name/email', async () => {
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
});
