<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { getPodcastArtwork } from '@/lib/images';
import ListenStatusButton from './ListenStatusButton.vue';

const props = defineProps<{
    podcast: {
        id?: string;
        collectionId?: number | string; // iTunes ID or fallback
        collectionName: string;
        artistName: string;
        artworkUrl600?: string;
        artworkUrl100?: string;
    };
}>();

// ... existing code ...

const imageLoaded = ref(false);
const imageError = ref(false);

const posterUrl = computed(() => getPodcastArtwork(props.podcast));

const onImageLoad = () => {
    imageLoaded.value = true;
};

const onImageError = () => {
    imageError.value = true;
    imageLoaded.value = true;
};

const externalId = computed(() => {
    return props.podcast.id || props.podcast.collectionId?.toString() || '';
});
</script>

<template>
    <div class="group block relative">
        <a :href="`/podcasts/${externalId}`" class="block h-full">
            <Card
                class="overflow-hidden border-0 bg-card shadow-md motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg h-full">

                <!-- Image Container with Aspect Ratio -->
                <div class="aspect-square w-full relative overflow-hidden bg-muted">
                    <!-- Skeleton Loading State -->
                    <div v-if="!imageLoaded && posterUrl" class="absolute inset-0 bg-muted animate-pulse" />

                    <!-- Image Fallback Placeholder -->
                    <div v-if="imageError || !posterUrl"
                        class="absolute inset-0 bg-muted flex items-center justify-center">
                        <svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>

                    <img v-show="imageLoaded && !imageError" v-if="posterUrl" :src="posterUrl"
                        :alt="props.podcast.collectionName"
                        class="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                        loading="lazy" @load="onImageLoad" @error="onImageError" />

                    <!-- Hover Overlay -->
                    <div
                        class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300 flex items-center justify-center">
                        <div
                            class="transform scale-90 group-hover:scale-100 motion-safe:transition-transform motion-safe:duration-300 flex flex-col items-center gap-3">
                            <ListenStatusButton :external-id="externalId" @click.prevent />
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <CardContent class="p-3">
                    <h3 class="font-semibold text-foreground line-clamp-1 motion-safe:group-hover:text-primary motion-safe:transition-colors"
                        :title="props.podcast.collectionName">
                        {{ props.podcast.collectionName }}
                    </h3>
                    <div class="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                        <span class="line-clamp-1 text-secondary-foreground" :title="props.podcast.artistName">{{
                            props.podcast.artistName }}</span>
                    </div>
                </CardContent>
            </Card>
        </a>
    </div>
</template>
