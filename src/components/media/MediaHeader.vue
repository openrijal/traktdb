<script setup lang="ts">
import { computed } from 'vue';
import { Star, Calendar, Info } from 'lucide-vue-next';
import WatchStatusButton from './WatchStatusButton.vue';

import { MediaType, PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { getTmdbImageUrl } from '@/lib/images';

const props = defineProps<{
    media: {
        id: number;
        title?: string;
        name?: string;
        overview: string | null;
        poster_path: string | null;
        backdrop_path: string | null;
        vote_average: number;
        release_date?: string;
        first_air_date?: string;
        status?: string;
        type: MediaType;
    };
}>();

const backdropUrl = computed(() =>
    getTmdbImageUrl(props.media.backdrop_path, 'backdrop')
);

const posterUrl = computed(() =>
    getTmdbImageUrl(props.media.poster_path) || PLACEHOLDER_IMAGE_URL
);

const year = computed(() => {
    const date = props.media.release_date || props.media.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
});

const title = computed(() => props.media.title || props.media.name);
const rating = computed(() => props.media.vote_average ? props.media.vote_average.toFixed(1) : 'NR');

const formatStatus = (s?: string) => s || 'Unknown';

</script>

<template>
    <div class="relative w-full h-[70vh] min-h-[500px] flex items-end">
        <!-- Backdrop Image -->
        <div class="absolute inset-0 z-0">
            <template v-if="backdropUrl">
                <img :src="backdropUrl" :alt="title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
            </template>
            <div v-else class="w-full h-full bg-card border-b border-white/5"></div>
        </div>

        <!-- Content Container -->
        <div
            class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col md:flex-row gap-8 items-start">

            <!-- Poster (Hidden on mobile? No, visible but smaller) -->
            <div
                class="hidden md:block w-64 rounded-xl overflow-hidden shadow-md border-4 border-white/5 rotate-2 shrink-0">
                <img :src="posterUrl" :alt="title" class="w-full h-auto" />
            </div>

            <!-- Text Content -->
            <div class="flex-1 space-y-4 text-foreground">
                <div class="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                    <span class="border border-primary/30 px-2 py-0.5 rounded">
                        {{ props.media.type === MediaType.TV ? 'TV Series' : 'Movie' }}
                    </span>
                    <span>&bull;</span>
                    <span>{{ formatStatus(props.media.status) }}</span>
                </div>

                <h1
                    class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                    {{ title }} <span class="text-2xl md:text-3xl text-muted-foreground font-normal">({{ year }})</span>
                </h1>

                <div class="flex items-center gap-6 text-sm text-secondary-foreground">
                    <div class="flex items-center gap-1.5">
                        <Star class="w-5 h-5 text-amber-500 fill-current" />
                        <span class="text-foreground font-bold text-lg">{{ rating }}</span>
                        <span>/ 10</span>
                    </div>
                    <div class="flex items-center gap-1.5"
                        v-if="props.media.release_date || props.media.first_air_date">
                        <Calendar class="w-4 h-4 text-muted-foreground" />
                        <span>{{ props.media.release_date || props.media.first_air_date }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-4 py-4">
                    <WatchStatusButton :tmdb-id="props.media.id" :type="props.media.type" />
                </div>

                <div v-if="props.media.overview" class="max-w-3xl">
                    <p class="text-lg text-secondary-foreground leading-relaxed font-light">{{ props.media.overview }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
