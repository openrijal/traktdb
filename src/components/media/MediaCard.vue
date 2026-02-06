<script setup lang="ts">
import { computed, ref } from 'vue';
import { Star } from 'lucide-vue-next';
import WatchStatusButton from './WatchStatusButton.vue';
import { Card, CardContent } from '@/components/ui/card';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE_URL, MediaType } from '@/lib/constants';
import { useLibraryStore } from '@/stores/library';

const props = defineProps<{
    media: {
        id: number; // TMDB ID
        title?: string;
        name?: string;
        poster_path: string | null;
        vote_average: number;
        release_date?: string;
        first_air_date?: string;
        media_type?: string;
        last_air_date?: string;
        lastAirDate?: string;
    };
    type?: MediaType; // explicit type override if media_type missing
}>();

const imageLoaded = ref(false);
const imageError = ref(false);

const posterUrl = computed(() =>
    props.media.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${props.media.poster_path}`
        : PLACEHOLDER_IMAGE_URL
);

const displayTitle = computed(() => props.media.title || props.media.name || 'Unknown');

const year = computed(() => {
    const date = props.media.release_date || props.media.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
});

const mediaType = computed(() => {
    const t = props.type || props.media.media_type;
    return t === 'tv' ? MediaType.TV : MediaType.MOVIE;
});
const rating = computed(() => props.media.vote_average ? props.media.vote_average.toFixed(1) : 'NR');

const store = useLibraryStore();
const hasNewEpisodes = computed(() => {
    if (mediaType.value !== MediaType.TV) return false;
    const s = store.items[`${props.media.id}_${mediaType.value}`];
    if (!s || s.status !== 'completed' || !s.updatedAt) return false;

    const lastAir = (props.media as any).last_air_date || (props.media as any).lastAirDate;
    if (!lastAir) return false;

    return new Date(lastAir) > new Date(s.updatedAt);
});

const onImageLoad = () => {
    imageLoaded.value = true;
};

const onImageError = () => {
    imageError.value = true;
    imageLoaded.value = true;
};
</script>

<template>
    <a :href="`/media/${mediaType}/${props.media.id}`" class="group block relative no-underline">
        <Card
            class="overflow-hidden border-0 bg-card shadow-md motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg h-full">

            <!-- Image Container with Aspect Ratio -->
            <div class="aspect-[2/3] w-full relative overflow-hidden bg-muted">
                <!-- Skeleton Loading State -->
                <div v-if="!imageLoaded" class="absolute inset-0 bg-muted animate-pulse" />
                
                <!-- Image Fallback Placeholder -->
                <div v-if="imageError" class="absolute inset-0 bg-muted flex flex-col items-center justify-center gap-2">
                    <svg class="w-10 h-10 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs text-muted-foreground/40">No Image</span>
                </div>
                
                <img 
                    v-show="imageLoaded && !imageError"
                    :src="posterUrl" 
                    :alt="displayTitle"
                    class="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                    loading="lazy"
                    @load="onImageLoad"
                    @error="onImageError"
                />

                <!-- Hover Overlay -->
                <div
                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300 flex items-center justify-center">
                    <div
                        class="transform scale-90 group-hover:scale-100 motion-safe:transition-transform motion-safe:duration-300 flex flex-col items-center gap-3">
                        <WatchStatusButton :tmdb-id="props.media.id" :type="mediaType" />
                        <span
                            class="text-sm font-medium text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">View
                            Details</span>
                    </div>
                </div>

                <!-- Rating Badge (always visible) -->
                <div class="absolute top-2 right-2 flex flex-col gap-2 items-end">
                    <div v-if="hasNewEpisodes"
                        class="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-1 rounded shadow-md motion-safe:animate-pulse">
                        New Episodes
                    </div>
                    <div
                        class="bg-black/70 backdrop-blur-md text-accent text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                        <Star class="w-3 h-3 fill-current" />
                        {{ rating }}
                    </div>
                </div>
            </div>

            <!-- Content -->
            <CardContent class="p-3">
                <h3 
                    :title="displayTitle"
                    class="font-semibold text-foreground line-clamp-1 motion-safe:group-hover:text-primary motion-safe:transition-colors">
                    {{ displayTitle }}</h3>
                <div class="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                    <span>{{ mediaType === 'tv' ? 'TV' : 'Movie' }}</span>
                    <span>{{ year }}</span>
                </div>
            </CardContent>
        </Card>
    </a>
</template>
