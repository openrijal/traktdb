
<script setup lang="ts">
import { computed } from 'vue';
import { Star } from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
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

const posterUrl = computed(() =>
    props.book.volumeInfo.imageLinks?.thumbnail || 
    props.book.volumeInfo.imageLinks?.smallThumbnail || 
    PLACEHOLDER_IMAGE_URL
);

const year = computed(() => {
    const date = props.book.volumeInfo.publishedDate;
    return date ? new Date(date).getFullYear() : 'N/A';
});

const authors = computed(() => {
    return props.book.volumeInfo.authors?.slice(0, 2).join(', ') || 'Unknown Author';
});

const rating = computed(() => props.book.volumeInfo.averageRating ? props.book.volumeInfo.averageRating.toFixed(1) : 'NR');

</script>

<template>
    <!-- Link to book detail page (TODO) -->
    <div class="group block relative">
        <Card
            class="overflow-hidden border-0 bg-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full">

            <!-- Image Container with Aspect Ratio -->
            <div class="aspect-[2/3] w-full relative overflow-hidden">
                <img :src="posterUrl" :alt="props.book.volumeInfo.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" />

                <!-- Hover Overlay -->
                <div
                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div
                        class="transform scale-90 group-hover:scale-100 transition-transform duration-300 flex flex-col items-center gap-3">
                        <ReadStatusButton :google-id="props.book.id" />
                        <!-- Details Link (Placeholder for now, could link to generic search or detail page) -->
                        <!-- <span
                            class="text-sm font-medium text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">View
                            Details</span> -->
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
                <h3 class="font-semibold text-gray-100 line-clamp-1 group-hover:text-indigo-400 transition-colors" :title="props.book.volumeInfo.title">
                    {{ props.book.volumeInfo.title }}
                </h3>
                <div class="flex flex-col gap-0.5 mt-1 text-xs text-gray-400">
                    <span class="line-clamp-1 text-gray-300" :title="authors">{{ authors }}</span>
                    <span>{{ year }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
