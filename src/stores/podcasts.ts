
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
    const items = ref<Record<string, PodcastItemState>>({});
    const isLoading = ref(false);

    async function fetchStatus(externalId: string) {
        try {
            const res = await fetch(`/api/podcasts/status?externalId=${externalId}`);
            if (res.ok) {
                const data = await res.json();
                items.value[externalId] = {
                    status: data.status,
                    updatedAt: data.updatedAt,
                    progress: data.progress || 0
                };
            }
        } catch (e) {
            console.error('Failed to fetch podcast status', e);
        }
    }

    async function updateStatus(externalId: string, status: UserPodcastStatus, podcastData?: any, progress?: number) {
        const previous = items.value[externalId];

        items.value[externalId] = {
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
                body: JSON.stringify({ externalId, status, progress, podcastData })
            });

            if (!res.ok) {
                throw new Error('API failed');
            }
        } catch (e) {
            console.error('Failed to update status', e);
            items.value[externalId] = previous;
        }
    }

    function getStatus(externalId: string): UserPodcastStatus {
        return items.value[externalId]?.status || null;
    }

    return {
        items,
        isLoading,
        fetchStatus,
        updateStatus,
        getStatus
    };
});
