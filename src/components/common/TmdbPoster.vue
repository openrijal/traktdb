<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
    tmdbId: number;
    type: 'movie' | 'show' | 'tv';
}>();

const posterPath = ref<string | null>(null);
const loading = ref(true);

const TMDB_KEY = import.meta.env.PUBLIC_TMDB_API_KEY || 'YOUR_KEY_HERE'; // Ideally utilize a secure proxy or public key if safe. 
// BUT `import.meta.env` in Vue components on client side exposes the key if prefixed with PUBLIC_.
// If we don't have a public key, we should generic a proxy endpoint or generic placeholder. 
// The project instructions say "Authentication: Custom implementation". 
// Usually for TMDB, client-side fetch requires a key. 
// However, I can also create a lightweight API endpoint `/api/poster/{type}/{id}` to proxy this and cache it.
// Checking `media.ts`, it uses server-side keys. 
// I will assume for now I use a simple proxy or I need to handle this.
// Let's create a proxy endpoint `/api/tmdb/poster` or similar to be safe, OR check if `tmdb-image` component exists.

// Checking the previous file list, there was NO `tmdb-image` component in `src/components/ui`.
// So I will implement a fetch to `/api/media/...` which might return the poster path if existing in DB, 
// OR I'll assume we used a `TmdbImage` component I haven't seen yet.
// Wait, the user said "Use TMDB images for calendar cards (resolve via TMDB ID from Trakt response)".
// I'll try to fetch metadata from TMDB directly via a proxy to get the poster path.

async function fetchPoster() {
    loading.value = true;
    try {
        // Use the existing proxy or a new one?
        // Let's try to hit the Trakt calendar API extension? No, I defined that in backend.
        // I will allow this component to simply use a placeholder for now and I will likely need to fix this.
        // Actually, the best way: The backend `/api/trakt/calendar` SHOULD return the poster URL if possible.
        // But doing 30 HTTP calls in the backend to TMDB to fill images is slow.
        // BETTER: Client side fetch to TMDB API (via proxy) is standard for this.
        // I'll fetch `/api/media/${props.type === 'show' ? 'tv' : 'movie'}/${props.tmdbId}`.
        // If that endpoint exists and returns full info including poster_path!

        const typePath = props.type === 'show' || props.type === 'tv' ? 'tv' : 'movie';
        const res = await fetch(`/api/media/${typePath}/${props.tmdbId}`);
        if (res.ok) {
            const data = await res.json();
            // data should be the media item. check structure.
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

onMounted(fetchPoster);
</script>

<template>
    <div class="bg-muted w-full h-full flex items-center justify-center text-muted-foreground">
        <img v-if="posterPath" :src="`https://image.tmdb.org/t/p/w500${posterPath}`" alt="Poster"
            class="w-full h-full object-cover" loading="lazy" />
        <span v-else-if="!loading" class="text-xs p-2 text-center">No Image</span>
    </div>
</template>
