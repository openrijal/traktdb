import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WatchStatus, MediaType } from '@/lib/constants';

export type UserMediaStatus = WatchStatus | null;

interface LibraryItemState {
    status: UserMediaStatus;
    updatedAt: string | null;
    progress: number;
}

export const useLibraryStore = defineStore('library', () => {
    // Map of "tmdbID_type" -> status object
    const items = ref<Record<string, LibraryItemState>>({});
    const isLoading = ref(false);

    const getKey = (tmdbId: number, type: MediaType) => `${tmdbId}_${type}`;

    async function fetchStatus(tmdbId: number, type: MediaType) {
        const key = getKey(tmdbId, type);
        // Don't fetch if we recently fetched? For now, simple fetch.

        try {
            const res = await fetch(`/api/library/status?tmdbId=${tmdbId}&type=${type}`);
            if (res.ok) {
                const data = await res.json();
                items.value[key] = {
                    status: data.status,
                    updatedAt: data.updatedAt,
                    progress: data.progress || 0
                };
            }
        } catch (e) {
            console.error('Failed to fetch library status', e);
        }
    }

    async function updateStatus(tmdbId: number, type: MediaType, status: UserMediaStatus) {
        const key = getKey(tmdbId, type);
        const previous = items.value[key];

        // Optimistic update
        items.value[key] = {
            ...previous,
            status: status,
            updatedAt: new Date().toISOString()
        };

        try {
            const res = await fetch('/api/library/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tmdbId, type, status })
            });

            if (!res.ok) {
                throw new Error('API failed');
            }
        } catch (e) {
            console.error('Failed to update status', e);
            // Revert
            items.value[key] = previous;
        }
    }

    function getStatus(tmdbId: number, type: MediaType): UserMediaStatus {
        return items.value[getKey(tmdbId, type)]?.status || null;
    }

    return {
        items,
        isLoading,
        fetchStatus,
        updateStatus,
        getStatus
    };
}, {
    persist: false // Library state might be too big for local storage persistence if we cache everything, but for status of individual items it's fine. 
    // Actually, let's NOT persist broadly to avoid staleness, or persist but invalidate often.
    // For now, no persistence, rely on fresh fetches or standard browser cache?
    // Pinia persist is good for simple apps. Let's leave it off to ensure accuracy.
});
