export interface CachedCalendar {
    data: any[];
    timestamp: number;
}

const CACHE_KEY = 'trakt-calendar-cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const getCalendarCache = (): any[] | null => {
    if (typeof window === 'undefined') return null;

    const stored = sessionStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    try {
        const cache: CachedCalendar = JSON.parse(stored);
        const now = Date.now();

        if (now - cache.timestamp < CACHE_DURATION_MS) {
            return cache.data;
        }
    } catch (e) {
        console.warn('Failed to parse calendar cache', e);
        sessionStorage.removeItem(CACHE_KEY);
    }

    return null;
};

export const setCalendarCache = (data: any[]) => {
    if (typeof window === 'undefined') return;

    const cache: CachedCalendar = {
        data,
        timestamp: Date.now(),
    };

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to save calendar cache', e);
    }
};

export const clearCalendarCache = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(CACHE_KEY);
};
