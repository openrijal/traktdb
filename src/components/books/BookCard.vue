
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Star } from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';
import { getBookThumbnail } from '@/lib/images';
import ReadStatusButton from './ReadStatusButton.vue';

const props = defineProps<{
    book: {
        id: string; // Google ID
        volumeInfo: {
            title: string;
            authors?: string[];
            imageLinks?: {
                thumbnail?: string;
                smallThumbnail?: string;
            };
            publishedDate?: string;
            averageRating?: number;
        };
    };
}>();

const imageLoaded = ref(false);
const imageError = ref(false);

const posterUrl = computed(() => getBookThumbnail(props.book.volumeInfo));

const year = computed(() => {
    const date = props.book.volumeInfo.publishedDate;
    return date ? new Date(date).getFullYear() : 'N/A';
});

const authors = computed(() => {
    return props.book.volumeInfo.authors?.slice(0, 2).join(', ') || 'Unknown Author';
});

const rating = computed(() => props.book.volumeInfo.averageRating ? props.book.volumeInfo.averageRating.toFixed(1) : 'NR');

const onImageLoad = () => {
    imageLoaded.value = true;
};

const onImageError = () => {
    imageError.value = true;
    imageLoaded.value = true;
};
</script>

<template>
    <div class="group block relative">
        <Card
            class="overflow-hidden border-0 bg-card shadow-md motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg h-full">

            <!-- Image Container with Aspect Ratio -->
            <div class="aspect-[2/3] w-full relative overflow-hidden bg-muted">
                <!-- Skeleton Loading State -->
                <div v-if="!imageLoaded && posterUrl" class="absolute inset-0 bg-muted animate-pulse" />

                <!-- Image Fallback Placeholder -->
                <div v-if="imageError || !posterUrl" class="absolute inset-0 bg-muted flex items-center justify-center">
                    <svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                <img
                    v-show="imageLoaded && !imageError"
                    v-if="posterUrl"
                    :src="posterUrl"
                    :alt="props.book.volumeInfo.title"
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
                        <ReadStatusButton :google-id="props.book.id" />
                    </div>
                </div>

                <!-- Rating Badge (always visible) -->
                <div class="absolute top-2 right-2 flex flex-col gap-2 items-end">
                    <div
                        class="bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                        <Star class="w-3 h-3 fill-current" />
                        {{ rating }}
                    </div>
                </div>
            </div>

            <!-- Content -->
            <CardContent class="p-3">
                <h3 class="font-semibold text-foreground line-clamp-1 motion-safe:group-hover:text-primary motion-safe:transition-colors" :title="props.book.volumeInfo.title">
                    {{ props.book.volumeInfo.title }}
                </h3>
                <div class="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                    <span class="line-clamp-1 text-secondary-foreground" :title="authors">{{ authors }}</span>
                    <span>{{ year }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
