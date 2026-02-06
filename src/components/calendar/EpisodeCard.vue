<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { formatEpisodeLabel } from '@/lib/date';

interface Episode {
  id: string;
  showTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  releaseDate: string;
  tmdbShowId: number;
}

const props = defineProps<{
  episode: Episode;
}>();

const imageLoaded = ref(false);
const imageError = ref(false);

const posterUrl = computed(() =>
  props.episode.showTitle
    ? `${TMDB_IMAGE_BASE_URL}${props.episode.tmdbShowId}-poster.jpg`
    : PLACEHOLDER_IMAGE_URL
);

const episodeLabel = computed(() =>
  formatEpisodeLabel(props.episode.seasonNumber, props.episode.episodeNumber)
);

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  imageError.value = true;
  imageLoaded.value = true;
};
</script>

<template>
  <a :href="`/media/show/${episode.tmdbShowId}`" class="group block relative no-underline">
    <Card class="overflow-hidden border-0 bg-card shadow-md motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg h-full">
      <div class="aspect-[2/3] w-full relative overflow-hidden bg-muted">
        <div v-if="!imageLoaded" class="absolute inset-0 bg-muted animate-pulse" />
        <div v-if="imageError" class="absolute inset-0 bg-muted flex items-center justify-center">
          <svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <img
          v-show="imageLoaded && !imageError"
          :src="posterUrl"
          :alt="episode.showTitle"
          class="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          loading="lazy"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span class="text-xs text-white font-medium px-1.5 py-0.5 bg-primary rounded">{{ episodeLabel }}</span>
        </div>
      </div>
      <CardContent class="p-3">
        <h3 class="font-medium text-sm line-clamp-1">{{ episode.showTitle }}</h3>
        <p class="text-xs text-muted-foreground line-clamp-1">{{ episode.episodeTitle }}</p>
      </CardContent>
    </Card>
  </a>
</template>
