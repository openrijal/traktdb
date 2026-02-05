<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown, ChevronUp, Calendar, Check, Loader2 } from 'lucide-vue-next';

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string;
  air_date?: string;
  vote_average?: number;
  watched?: boolean;
}

interface Season {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path?: string;
  air_date?: string;
  episode_count?: number;
}

interface Props {
  season: Season;
  isExpanded: boolean;
  episodes: Episode[];
  togglingEpisode: number | null;
  togglingSeason: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toggle: [seasonNumber: number];
  toggleEpisode: [episodeId: number, watched: boolean];
  toggleSeason: [seasonId: number, episodes: Episode[], watched: boolean];
}>();

const togglingEpisode = ref<number | null>(null);

const posterUrl = computed(() => {
  if (props.season.poster_path) {
    return `https://image.tmdb.org/t/p/w300${props.season.poster_path}`;
  }
  return null;
});

const watchedCount = computed(() => props.episodes.filter((ep: Episode) => ep.watched).length);
const progressPercent = computed(() => {
  if (props.episodes.length === 0) return 0;
  return Math.round((watchedCount.value / props.episodes.length) * 100);
});

const isSeasonComplete = computed(() => {
  return props.episodes.length > 0 && props.episodes.every((ep: Episode) => ep.watched);
});

const isUpcoming = computed(() => {
  if (!props.season.air_date) return true;
  return new Date(props.season.air_date) > new Date();
});

const hasAiredEpisodes = computed(() => {
  const now = new Date();
  return props.episodes.some((ep: Episode) => !ep.air_date || new Date(ep.air_date) <= now);
});

const formatDate = (date?: string) => {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const handleToggle = () => {
  if (isUpcoming.value && !hasAiredEpisodes.value) return;
  emit('toggle', props.season.season_number);
};

const handleEpisodeToggle = async (episode: Episode) => {
  if (togglingEpisode.value !== null) return;
  togglingEpisode.value = episode.id;
  try {
    await emit('toggleEpisode', episode.id, !episode.watched);
  } finally {
    togglingEpisode.value = null;
  }
};

const handleMarkSeasonComplete = async () => {
  if (isSeasonComplete.value) {
    emit('toggleSeason', props.season.id, props.episodes, !isSeasonComplete.value);
  } else {
    emit('toggleSeason', props.season.id, props.episodes, true);
  }
};
</script>

<template>
  <div class="season-card bg-card rounded-lg border border-border overflow-hidden">
    <button
      class="season-header w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
      @click="handleToggle"
      :aria-expanded="isExpanded"
      :disabled="isUpcoming && !hasAiredEpisodes"
    >
      <div class="season-poster w-16 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
        <img
          v-if="posterUrl"
          :src="posterUrl"
          :alt="season.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
          No Image
        </div>
      </div>

      <div class="season-info flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-foreground">
          Season {{ season.season_number }}
        </h3>
        <p v-if="season.name && season.name !== `Season ${season.season_number}`" class="text-sm text-muted-foreground truncate">
          {{ season.name }}
        </p>
        <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            {{ formatDate(season.air_date) }}
          </span>
          <span>{{ season.episode_count || episodes.length }} episodes</span>
          <span v-if="progressPercent > 0" class="text-primary">
            {{ progressPercent }}% watched
          </span>
        </div>
      </div>

      <div class="expand-icon text-muted-foreground flex items-center gap-2">
        <span v-if="isUpcoming && !hasAiredEpisodes" class="text-xs text-muted-foreground">
          Upcoming
        </span>
        <ChevronUp v-if="isExpanded" class="w-5 h-5" />
        <ChevronDown v-else class="w-5 h-5" />
      </div>
    </button>

    <div v-if="isExpanded" class="episodes-container border-t border-border">
      <div class="episodes-header flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <span class="text-sm text-muted-foreground">
          {{ watchedCount }} / {{ episodes.length }} episodes watched
        </span>
        <button
          v-if="episodes.length > 0"
          @click="handleMarkSeasonComplete"
          class="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <Check class="w-3 h-3" />
          {{ isSeasonComplete ? 'Mark all unwatched' : 'Mark season complete' }}
        </button>
      </div>

      <div v-if="episodes.length === 0" class="p-4 text-center text-muted-foreground">
        Loading episodes...
      </div>
      <div v-else class="episodes-list divide-y divide-border">
        <div
          v-for="episode in episodes"
          :key="episode.id"
          class="episode-item flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors"
        >
          <div class="episode-number w-8 text-center text-sm text-muted-foreground font-mono">
            {{ episode.episode_number }}
          </div>
          <div class="episode-info flex-1 min-w-0">
            <h4 class="text-sm font-medium text-foreground truncate">
              {{ episode.name || `Episode ${episode.episode_number}` }}
            </h4>
            <p v-if="episode.overview" class="text-xs text-muted-foreground line-clamp-2 mt-1">
              {{ episode.overview }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{{ formatDate(episode.air_date) }}</span>
              <span v-if="episode.vote_average">
                {{ (episode.vote_average * 10).toFixed(0) }}%
              </span>
            </div>
          </div>
          <button
            class="watch-status flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors"
            :class="episode.watched
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-primary'"
            :aria-label="episode.watched ? 'Mark as unwatched' : 'Mark as watched'"
            :disabled="togglingEpisode === episode.id"
            @click="handleEpisodeToggle(episode)"
          >
            <Loader2 v-if="togglingEpisode === episode.id" class="w-4 h-4 mx-auto animate-spin" />
            <svg v-else-if="episode.watched" class="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
