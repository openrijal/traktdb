import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UpcomingList from './UpcomingList.vue';
import * as Cache from '../../lib/calendar-cache';

// Mock child components to avoid deep rendering issues
vi.mock('@/components/dashboard/UpcomingCarousel.vue', () => ({
    default: {
        template: '<div data-testid="upcoming-carousel"></div>',
        props: ['items', 'loading']
    }
}));

vi.mock('@/components/ui/button', () => ({
    Button: {
        template: '<button><slot /></button>'
    }
}));

vi.mock('lucide-vue-next', () => ({
    RefreshCw: { template: '<svg />' }
}));

// Mock calendar cache module - Auto mock
vi.mock('../../lib/calendar-cache');
import { getCalendarCache, setCalendarCache, clearCalendarCache } from '../../lib/calendar-cache';

describe('UpcomingList.vue', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
        // Default cache miss
        vi.mocked(getCalendarCache).mockReturnValue(null);
    });

    it('shows error message on API failure', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500
        });

        const wrapper = mount(UpcomingList);
        await flushPromises();

        expect(wrapper.text()).toContain('Failed to load upcoming schedule');
    });

    it('shows auth error message on 401', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401
        });

        const wrapper = mount(UpcomingList);
        await flushPromises();

        expect(wrapper.text()).toContain('Connect Trakt to see your schedule');
        expect(clearCalendarCache).toHaveBeenCalled();
    });

    it('Passes data to carousel on success', async () => {
        const cachedData = [{ id: 1, title: 'Show 1' }];
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: { days: cachedData } })
        });

        // Ensure cache is missed so fetch is called
        vi.mocked(getCalendarCache).mockReturnValue(null);

        const wrapper = mount(UpcomingList);
        await flushPromises();

        expect(wrapper.findComponent({ name: 'UpcomingCarousel' }).exists()).toBe(true);
        const carousel = wrapper.findComponent({ name: 'UpcomingCarousel' });
        // The component logic transforms API data. Assuming simple pass-through or similar.
        // Actually the component passes `items`.
        expect(carousel.props('items')).toEqual(cachedData);
        expect(setCalendarCache).toHaveBeenCalledWith(cachedData);
    });

    it('uses cache if available', async () => {
        const cachedData = [{ id: 99, title: 'Cached Show' }];
        vi.mocked(getCalendarCache).mockReturnValue(cachedData);

        const wrapper = mount(UpcomingList);
        await flushPromises();

        expect(mockFetch).not.toHaveBeenCalled();
        const carousel = wrapper.findComponent({ name: 'UpcomingCarousel' });
        expect(carousel.props('items')).toEqual(cachedData);
    });

    it('bypass cache on refresh', async () => {
        const cachedData = [{ id: 99, title: 'Cached Show' }];
        vi.mocked(getCalendarCache).mockReturnValue(cachedData);

        const wrapper = mount(UpcomingList);
        await flushPromises();

        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { days: [] } })
        });

        // Initial load used cache
        expect(mockFetch).not.toHaveBeenCalled();

        // Click refresh
        await wrapper.find('.refresh-button').trigger('click');

        expect(mockFetch).toHaveBeenCalledWith('/api/trakt/calendar');
    });
});
