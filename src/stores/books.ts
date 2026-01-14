
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ReadStatus } from '@/lib/constants';

export type UserBookStatus = ReadStatus | null;

interface BookItemState {
    status: UserBookStatus;
    updatedAt: string | null;
    progress: number;
}

export const useBookStore = defineStore('books', () => {
    // Map of "googleId" -> status object
    const items = ref<Record<string, BookItemState>>({});
    const isLoading = ref(false);

    async function fetchStatus(googleId: string) {
        try {
            const res = await fetch(`/api/books/status?googleId=${googleId}`);
            if (res.ok) {
                const data = await res.json();
                items.value[googleId] = {
                    status: data.status,
                    updatedAt: data.updatedAt,
                    progress: data.progress || 0
                };
            }
        } catch (e) {
            console.error('Failed to fetch book status', e);
        }
    }

    async function updateStatus(googleId: string, status: UserBookStatus, progress?: number) {
        const previous = items.value[googleId];

        // Optimistic update
        items.value[googleId] = {
            status: status,
            updatedAt: new Date().toISOString(),
            progress: progress !== undefined ? progress : (previous?.progress || 0)
        };

        try {
            const res = await fetch('/api/books/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ googleId, status, progress })
            });

            if (!res.ok) {
                throw new Error('API failed');
            }
        } catch (e) {
            console.error('Failed to update status', e);
            // Revert
            items.value[googleId] = previous;
        }
    }

    function getStatus(googleId: string): UserBookStatus {
        return items.value[googleId]?.status || null;
    }

    return {
        items,
        isLoading,
        fetchStatus,
        updateStatus,
        getStatus
    };
});
