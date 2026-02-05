<script setup lang="ts">
import { cn } from "@/lib/utils";

const posters = [
    "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg", // Fast X
    "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2K5ggV6.jpg", // Mario
    "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    "https://image.tmdb.org/t/p/w500/voHuMluYmKydmgyJgKlp9lBbL7z.jpg",
    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", // Spider-Verse
    "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Yaqq75dCa.jpg",
    "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5U7aSIYn.jpg",
    "https://image.tmdb.org/t/p/w500/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", // Godfather
];

// Duplicate for seamless loop
const allPosters = [...posters, ...posters];

const props = defineProps<{
    direction?: 'up' | 'down';
    speed?: 'slow' | 'normal' | 'fast';
    class?: string;
}>();

const durationClass = {
    slow: 'duration-[60s]',
    normal: 'duration-[40s]',
    fast: 'duration-[20s]',
}[props.speed || 'normal'];

</script>

<template>
    <div
        :class="cn('relative h-full overflow-hidden w-48 opacity-50 hover:opacity-100 transition-opacity', props.class)">
        <div :class="cn(
            'flex flex-col gap-4 w-full animate-scroll-y',
            durationClass,
            props.direction === 'down' ? 'direction-reverse' : ''
        )">
            <div v-for="(poster, i) in allPosters" :key="i"
                class="w-full shrink-0 rounded-xl overflow-hidden shadow-md aspect-[2/3]">
                <img :src="poster" alt="Poster" class="w-full h-full object-cover" loading="lazy" />
            </div>
        </div>
        <!-- Gradient Overlays for smooth fade -->
        <div
            class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none">
        </div>
        <div
            class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none">
        </div>
    </div>
</template>

<style scoped>
@keyframes scroll-y {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-50%);
    }
}

.animate-scroll-y {
    animation: scroll-y linear infinite;
}

.direction-reverse {
    animation-direction: reverse;
}
</style>
