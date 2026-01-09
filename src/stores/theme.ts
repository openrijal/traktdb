import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDark: true,
    }),
    actions: {
        toggleTheme() {
            this.isDark = !this.isDark;
            this.applyTheme();
        },
        initTheme() {
            if (typeof localStorage !== 'undefined') {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    this.isDark = true;
                } else {
                    this.isDark = false;
                }
            }
            this.applyTheme();
        },
        applyTheme() {
            if (typeof document !== 'undefined') {
                if (this.isDark) {
                    document.documentElement.classList.add('dark');
                    localStorage.theme = 'dark';
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.theme = 'light';
                }
            }
        }
    },
    persist: true,
});
