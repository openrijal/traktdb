<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Check, Loader2 } from 'lucide-vue-next';
import { formatEpisodeLabel } from '@/lib/date';
import { TMDB_IMAGE_BASE_URL } from '@/lib/constants';

const props = defineProps<{
    tmdbId: number;
}>();

interface NextEpisode {
    episodeId: number;
    seasonNumber: number;
    episodeNumber: number;
    episodeName: string;
    overview: string | null;
    stillPath: string | null;
    airDate: string | null;
    voteAverage: number | null;
}

const nextEpisode = ref<NextEpisode | null>(null);
const loading = ref(true);
const marking = ref(false);

async function fetchNextEpisode() {
    try {
        const response = await fetch(`/api/library/next-episode?tmdbId=${props.tmdbId}`);
        if (response.ok) {
            const json = await response.json();
            nextEpisode.value = json.success ? json.data : null;
        }
    } catch (e) {
        console.error('Failed to fetch next episode:', e);
    } finally {
        loading.value = false;
    }
}

async function markWatched() {
    if (!nextEpisode.value || marking.value) return;
    marking.value = true;

    try {
        const response = await fetch('/api/library/episode-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                episodeId: nextEpisode.value.episodeId,
                watched: true,
            }),
        });

        if (response.ok) {
            await fetchNextEpisode();
        }
    } catch (e) {
        console.error('Failed to mark episode as watched:', e);
    } finally {
        marking.value = false;
    }
}

const episodeLabel = computed(() => {
    if (!nextEpisode.value) return '';
    return formatEpisodeLabel(nextEpisode.value.seasonNumber, nextEpisode.value.episodeNumber);
});

function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

onMounted(fetchNextEpisode);
</script>

<template>
    <section v-if="!loading && nextEpisode" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h2 class="text-xl font-semibold text-foreground mb-4">Continue Watching</h2>
        <div class="bg-card rounded-lg border border-border overflow-hidden flex flex-col sm:flex-row">
            <!-- Episode Still Image -->
            <div class="sm:w-72 aspect-video sm:aspect-auto relative overflow-hidden bg-muted flex-shrink-0">
                <img v-if="nextEpisode.stillPath"
                    :src="`${TMDB_IMAGE_BASE_URL}${nextEpisode.stillPath}`"
                    :alt="nextEpisode.episodeName"
                    class="w-full h-full object-cover" />
                <div v-else class="w-full h-full min-h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                    No Image
                </div>
                <div class="absolute bottom-2 left-2">
                    <span class="text-xs font-medium text-white px-2 py-1 bg-primary rounded shadow-sm">
                        {{ episodeLabel }}
                    </span>
                </div>
            </div>

            <!-- Episode Info -->
            <div class="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-semibold text-foreground">
                        {{ nextEpisode.episodeName }}
                    </h3>
                    <p v-if="nextEpisode.overview"
                        class="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {{ nextEpisode.overview }}
                    </p>
                    <div class="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span v-if="nextEpisode.airDate">{{ formatDate(nextEpisode.airDate) }}</span>
                    </div>
                </div>

                <div class="mt-4">
                    <button @click="markWatched" :disabled="marking"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                        <Loader2 v-if="marking" class="w-4 h-4 animate-spin" />
                        <Check v-else class="w-4 h-4" />
                        Mark as Watched
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
