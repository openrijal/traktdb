
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ListenStatus } from '@/lib/constants';

export type UserPodcastStatus = ListenStatus | null;

interface PodcastItemState {
    status: UserPodcastStatus;
    updatedAt: string | null;
    progress: number;
}

export const usePodcastStore = defineStore('podcasts', () => {
    // Map of "itunesId" -> status object
    const items = ref<Record<string, PodcastItemState>>({});
    const isLoading = ref(false);

    async function fetchStatus(itunesId: string) {
        try {
            const res = await fetch(`/api/podcasts/status?itunesId=${itunesId}`);
            if (res.ok) {
                const data = await res.json();
                items.value[itunesId] = {
                    status: data.status,
                    updatedAt: data.updatedAt,
                    progress: data.progress || 0
                };
            }
        } catch (e) {
            console.error('Failed to fetch podcast status', e);
        }
    }

    async function updateStatus(itunesId: string, status: UserPodcastStatus, progress?: number) {
        const previous = items.value[itunesId];

        // Optimistic update
        items.value[itunesId] = {
            status: status,
            updatedAt: new Date().toISOString(),
            progress: progress !== undefined ? progress : (previous?.progress || 0)
        };

        try {
            const res = await fetch('/api/podcasts/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ itunesId, status, progress })
            });

            if (!res.ok) {
                throw new Error('API failed');
            }
        } catch (e) {
            console.error('Failed to update status', e);
            // Revert
            items.value[itunesId] = previous;
        }
    }

    function getStatus(itunesId: string): UserPodcastStatus {
        return items.value[itunesId]?.status || null;
    }

    return {
        items,
        isLoading,
        fetchStatus,
        updateStatus,
        getStatus
    };
});
