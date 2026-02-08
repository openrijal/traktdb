import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FontSizeToggle from './FontSizeToggle.vue';

describe('FontSizeToggle', () => {
    const store: Record<string, string> = {};

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, val: string) => { store[key] = val; },
            removeItem: (key: string) => { delete store[key]; },
            clear: () => {
                Object.keys(store).forEach((k) => delete store[k]);
            },
        });
        document.documentElement.removeAttribute('data-font-size');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('defaults to small and sets data-font-size', async () => {
        mount(FontSizeToggle);
        expect(document.documentElement.getAttribute('data-font-size')).toBe('small');
    });

    it('persists selection to localStorage and updates data attribute', async () => {
        const wrapper = mount(FontSizeToggle);
        const buttons = wrapper.findAll('button');
        await buttons[1].trigger('click'); // medium

        expect(store['font-size']).toBe('medium');
        expect(document.documentElement.getAttribute('data-font-size')).toBe('medium');
    });
});
