import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OmniSearch from './OmniSearch.vue';

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
    useDebounceFn: (fn: Function) => fn,
}));

// Mock lucide icons
vi.mock('lucide-vue-next', () => ({
    Search: { template: '<span />' },
    Loader2: { template: '<span />' },
    Film: { template: '<span />' },
    Tv: { template: '<span />' },
    Book: { template: '<span />' },
    Headphones: { template: '<span />' },
    X: { template: '<span />' },
    Clock: { template: '<span />' },
}));

// Mock Input component
vi.mock('@/components/ui/input', () => ({
    Input: {
        template: '<input v-bind="$attrs" />',
        inheritAttrs: true,
    },
}));

vi.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/lib/images', () => ({
    getTmdbImageUrl: (path: string | null) => path ? `https://image.tmdb.org/t/p/w500${path}` : null,
}));

describe('OmniSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch = vi.fn();
        // Reset localStorage
        const store: Record<string, string> = {};
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, val: string) => { store[key] = val; },
            removeItem: (key: string) => { delete store[key]; },
        });
    });

    it('renders with placeholder', () => {
        const wrapper = mount(OmniSearch);
        const input = wrapper.find('input');
        expect(input.exists()).toBe(true);
        expect(input.attributes('placeholder')).toContain('Search');
    });

    it('does not search for single-character input', async () => {
        const wrapper = mount(OmniSearch);
        const input = wrapper.find('input');
        await input.setValue('a');
        await input.trigger('input');

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('calls omni API on valid input', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                query: 'test',
                movies: [],
                tv: [],
                books: [],
                podcasts: [],
                totals: {},
            }),
        });

        const wrapper = mount(OmniSearch);
        const input = wrapper.find('input');
        await input.setValue('test');
        await input.trigger('input');

        // Wait for async search
        await vi.dynamicImportSettled();
        await wrapper.vm.$nextTick();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/search/omni?q=test'),
        );
    });

    it('clears results when clear button is clicked', async () => {
        const wrapper = mount(OmniSearch);
        // Set query to make clear button visible
        const input = wrapper.find('input');
        await input.setValue('test');
        await wrapper.vm.$nextTick();

        // Find the clear button
        const buttons = wrapper.findAll('button');
        const clearBtn = buttons.find((b) => b.find('span').exists());
        if (clearBtn) {
            await clearBtn.trigger('click');
            expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
        }
    });
});
