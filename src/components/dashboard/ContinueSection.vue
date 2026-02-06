<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Play } from 'lucide-vue-next';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

interface WatchingItem {
    id: number;
    tmdbId: number;
    type: string;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    progress: number | null;
    updatedAt: string | null;
}

const continueWatching = ref<WatchingItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchWatching() {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch('/api/library/watching');
        if (!response.ok) {
            if (response.status === 401) {
                error.value = 'Sign in to see your watching list.';
                return;
            }
            throw new Error('Failed to fetch watching list');
        }
        const json = await response.json();
        if (json.success && json.data) {
            continueWatching.value = json.data;
        } else {
            continueWatching.value = [];
        }
    } catch (e) {
        console.error(e);
        error.value = 'Failed to load watching list.';
    } finally {
        loading.value = false;
    }
}

function getImageUrl(item: WatchingItem): string {
    const path = item.backdropPath || item.posterPath;
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : PLACEHOLDER_IMAGE_URL;
}

function getDetailUrl(item: WatchingItem): string {
    return `/${item.type}/${item.tmdbId}`;
}

onMounted(fetchWatching);
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">Continue Watching</h2>
        </div>

        <div v-if="loading" class="flex gap-4 overflow-hidden">
            <div v-for="i in 3" :key="i"
                class="min-w-[250px] aspect-video bg-muted animate-pulse rounded-lg shrink-0"></div>
        </div>

        <div v-else-if="error"
            class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {{ error }}
        </div>

        <div v-else-if="continueWatching.length > 0" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <a v-for="item in continueWatching" :key="item.id" :href="getDetailUrl(item)"
                class="min-w-[250px] aspect-video bg-muted rounded-lg flex items-center justify-center relative group cursor-pointer overflow-hidden border border-border/50">
                <img :src="getImageUrl(item)" :alt="item.title"
                    class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <Play class="fill-white text-white w-12 h-12 opacity-80 group-hover:scale-110 transition-transform relative z-10" />

                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-10">
                    <div class="text-sm font-medium text-white">{{ item.title }}</div>
                    <div v-if="item.progress" class="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div class="h-full bg-primary" :style="{ width: `${Math.min(item.progress, 100)}%` }"></div>
                    </div>
                </div>
            </a>
        </div>

        <div v-else class="py-8 text-center bg-muted/30 rounded-lg border border-border/50 border-dashed">
            <Play class="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <p class="text-muted-foreground">Start watching shows to see them here.</p>
        </div>
    </div>
</template>
