import { defineStore } from 'pinia';
import { authClient } from '@/lib/auth-client';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as typeof authClient.$Infer.Session.user | null,
        session: null as typeof authClient.$Infer.Session.session | null,
        loading: false,
    }),
    actions: {
        async fetchSession() {
            this.loading = true;
            try {
                const { data } = await authClient.useSession();
                if (data.value) {
                    this.user = data.value.user;
                    this.session = data.value.session;
                } else {
                    this.user = null;
                    this.session = null;
                }
            } catch (error) {
                console.error('Failed to fetch session', error);
            } finally {
                this.loading = false;
            }
        },
        async signInWithGoogle() {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/dashboard' // TODO: make dynamic
            });
        },
        async signOut() {
            await authClient.signOut();
            this.user = null;
            this.session = null;
            window.location.href = '/';
        }
    },
    persist: true,
});
