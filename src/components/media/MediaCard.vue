<script setup lang="ts">
import { computed } from 'vue';
import { Star } from 'lucide-vue-next';
import WatchStatusButton from './WatchStatusButton.vue';

const props = defineProps<{
    media: {
        id: number; // TMDB ID
        title: string;
        poster_path: string | null;
        vote_average: number;
        release_date?: string;
        first_air_date?: string;
        media_type?: string;
    };
    type?: 'movie' | 'tv'; // explicit type override if media_type missing
}>();

import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE_URL, MediaType } from '@/lib/constants';

const posterUrl = computed(() =>
    props.media.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${props.media.poster_path}`
        : PLACEHOLDER_IMAGE_URL
);

const year = computed(() => {
    const date = props.media.release_date || props.media.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
});

const mediaType = computed(() => {
    const t = props.type || props.media.media_type;
    return t === 'tv' ? MediaType.TV : MediaType.MOVIE;
});
const rating = computed(() => props.media.vote_average ? props.media.vote_average.toFixed(1) : 'NR');

import { useLibraryStore } from '@/stores/library';
const store = useLibraryStore();
// Note: WatchStatusButton triggers a fetch, so store should populate eventually.
// But MediaCard isn't triggering fetch itself.
// If we are on Library page, we might want to pass "isNewEpisodes" as a prop to avoid N+1 store reads/reactivity issues?
// Or just rely on store.
// Let's use store for now.
const hasNewEpisodes = computed(() => {
    if (mediaType.value !== MediaType.TV) return false;
    const s = store.items[`${props.media.id}_${mediaType.value}`];
    if (!s || s.status !== 'completed' || !s.updatedAt) return false;

    // Check if new content aired after user updated status
    // Use last_air_date from media prop (ensure it is passed)
    const lastAir = (props.media as any).last_air_date || (props.media as any).lastAirDate;
    if (!lastAir) return false;

    return new Date(lastAir) > new Date(s.updatedAt);
});


</script>

<template>
    <a :href="`/media/${mediaType}/${props.media.id}`"
        class="group block relative bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

        <!-- Image Container with Aspect Ratio -->
        <div class="aspect-[2/3] w-full relative overflow-hidden">
            <img :src="posterUrl" :alt="props.media.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy" />

            <!-- Hover Overlay -->
            <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div
                    class="transform scale-90 group-hover:scale-100 transition-transform duration-300 flex flex-col items-center gap-3">
                    <WatchStatusButton :tmdb-id="props.media.id" :type="mediaType" />
                    <span
                        class="text-sm font-medium text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">View
                        Details</span>
                </div>
            </div>

            <!-- Rating Badge (always visible) -->
            <div class="absolute top-2 right-2 flex flex-col gap-2 items-end">
                <div v-if="hasNewEpisodes"
                    class="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                    New Episodes
                </div>
                <div
                    class="bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                    <Star class="w-3 h-3 fill-current" />
                    {{ rating }}
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="p-3">
            <h3 class="font-semibold text-gray-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">{{
                props.media.title }}</h3>
            <div class="flex justify-between items-center mt-1 text-xs text-gray-400">
                <span class="capitalize">{{ mediaType }}</span>
                <span>{{ year }}</span>
            </div>
        </div>
    </a>
</template>
