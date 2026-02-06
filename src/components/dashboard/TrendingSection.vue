<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import MediaCard from '@/components/media/MediaCard.vue';
import { Loader2 } from 'lucide-vue-next';
import { useLibraryStore } from '@/stores/library';
import { MediaType, WatchStatus } from '@/lib/constants';

interface Props {
    initialData?: any[];
}

const props = defineProps<Props>();
const trending = ref<any[]>(props.initialData || []);
const loading = ref(!props.initialData);
const error = ref<string | null>(null);
const statusesLoaded = ref(false);

const libraryStore = useLibraryStore();

const HIDDEN_STATUSES: (WatchStatus | null)[] = [
    WatchStatus.WATCHING,
    WatchStatus.COMPLETED,
    WatchStatus.DROPPED,
];

const filteredTrending = computed(() => {
    if (!statusesLoaded.value) return trending.value.slice(0, 12);

    return trending.value.filter(item => {
        const type = item.media_type === 'tv' ? MediaType.TV : MediaType.MOVIE;
        const status = libraryStore.getStatus(item.id, type);
        return !HIDDEN_STATUSES.includes(status);
    }).slice(0, 12);
});

async function fetchStatuses() {
    const promises = trending.value.slice(0, 20).map(item => {
        const type = item.media_type === 'tv' ? MediaType.TV : MediaType.MOVIE;
        return libraryStore.fetchStatus(item.id, type);
    });
    await Promise.allSettled(promises);
    statusesLoaded.value = true;
}

onMounted(async () => {
    if (!props.initialData || props.initialData.length === 0) {
        try {
            const res = await fetch('/api/media/trending');
            if (res.ok) {
                const data = await res.json();
                trending.value = data.results || [];
            } else {
                error.value = 'Failed to load trending content';
            }
        } catch (e) {
            error.value = 'An error occurred';
        } finally {
            loading.value = false;
        }
    }

    if (trending.value.length > 0) {
        fetchStatuses();
    }
});
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">Trending Now</h2>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="error" class="text-red-400 py-4">
            {{ error }}
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MediaCard v-for="item in filteredTrending" :key="item.id" :media="item" :type="item.media_type" />
        </div>
    </div>
</template>
