<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
    tmdbId: number;
    type: 'movie' | 'show' | 'tv';
}>();

const posterPath = ref<string | null>(null);
const loading = ref(true);

async function fetchPoster() {
    loading.value = true;
    try {
        const typePath = props.type === 'show' || props.type === 'tv' ? 'tv' : 'movie';
        const res = await fetch(`/api/media/${typePath}/${props.tmdbId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.poster_path || data.posterPath) {
                posterPath.value = data.poster_path || data.posterPath;
            }
        }
    } catch (e) {
        console.error("Failed to load poster", e);
    } finally {
        loading.value = false;
    }
}

// Re-fetch when props change (e.g. component reuse with different data)
watch(() => [props.tmdbId, props.type], () => {
    posterPath.value = null;
    fetchPoster();
});

onMounted(fetchPoster);
</script>

<template>
    <div class="bg-muted w-full h-full flex items-center justify-center text-muted-foreground">
        <img v-if="posterPath" :src="`https://image.tmdb.org/t/p/w500${posterPath}`" alt="Poster"
            class="w-full h-full object-cover" />
        <span v-else-if="!loading" class="text-xs p-2 text-center">No Image</span>
    </div>
</template>
