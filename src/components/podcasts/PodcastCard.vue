
<script setup lang="ts">
import { computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import ListenStatusButton from './ListenStatusButton.vue';

const props = defineProps<{
    podcast: {
        collectionId: number; // iTunes ID
        collectionName: string;
        artistName: string;
        artworkUrl600?: string;
        artworkUrl100?: string;
    };
}>();

const posterUrl = computed(() =>
    props.podcast.artworkUrl600 || 
    props.podcast.artworkUrl100 || 
    PLACEHOLDER_IMAGE_URL
);

</script>

<template>
    <div class="group block relative">
        <Card
            class="overflow-hidden border-0 bg-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full">

            <!-- Image Container with Aspect Ratio -->
            <div class="aspect-square w-full relative overflow-hidden">
                <img :src="posterUrl" :alt="props.podcast.collectionName"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" />

                <!-- Hover Overlay -->
                <div
                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div
                        class="transform scale-90 group-hover:scale-100 transition-transform duration-300 flex flex-col items-center gap-3">
                        <ListenStatusButton :itunes-id="props.podcast.collectionId.toString()" />
                    </div>
                </div>
            </div>

            <!-- Content -->
            <CardContent class="p-3">
                <h3 class="font-semibold text-gray-100 line-clamp-1 group-hover:text-indigo-400 transition-colors" :title="props.podcast.collectionName">
                    {{ props.podcast.collectionName }}
                </h3>
                <div class="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
                    <span class="line-clamp-1 text-gray-300" :title="props.podcast.artistName">{{ props.podcast.artistName }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
