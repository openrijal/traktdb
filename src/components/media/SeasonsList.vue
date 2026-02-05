<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SeasonCard from './SeasonCard.vue';

interface Season {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path?: string;
  air_date?: string;
  episode_count?: number;
  episodes?: Episode[];
}

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

interface Props {
  tvId: number;
  seasons?: {
    id: number;
    season_number: number;
    name: string;
    overview?: string;
    poster_path?: string;
    air_date?: string;
    episode_count?: number;
  }[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  error: [message: string];
  retry: [];
}>();

const loading = ref(true);
const error = ref<string | null>(null);
const expandedSeason = ref<number | null>(null);
const seasonsData = ref<Season[]>([]);
const togglingEpisode = ref<number | null>(null);
const togglingSeason = ref<number | null>(null);

const loadSeasonEpisodes = async (seasonNumber: number) => {
  if (expandedSeason.value === seasonNumber) {
    expandedSeason.value = null;
    return;
  }

  expandedSeason.value = seasonNumber;
  const season = seasonsData.value.find(s => s.season_number === seasonNumber);

  if (season?.episodes) return;

  try {
    const response = await fetch(`/api/media/tv/${props.tvId}/season/${seasonNumber}`);
    if (!response.ok) throw new Error('Failed to load season');
    const data = await response.json();
    const idx = seasonsData.value.findIndex(s => s.season_number === seasonNumber);
    if (idx !== -1) {
      seasonsData.value[idx].episodes = data.episodes || [];
    }
  } catch (err) {
    error.value = 'Failed to load episodes';
    console.error(err);
    emit('error', error.value);
  }
};

const handleToggleEpisode = async (episodeId: number, watched: boolean) => {
  togglingEpisode.value = episodeId;
  try {
    const response = await fetch('/api/library/episode-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeId, watched }),
    });

    if (!response.ok) throw new Error('Failed to update episode status');

    // Update local state
    for (const season of seasonsData.value) {
      if (season.episodes) {
        const ep = season.episodes.find(e => e.id === episodeId);
        if (ep) {
          ep.watched = watched;
          break;
        }
      }
    }
  } catch (err) {
    console.error('Failed to update episode status:', err);
    emit('error', 'Failed to update episode status');
  } finally {
    togglingEpisode.value = null;
  }
};

const handleToggleSeason = async (seasonId: number, episodes: Episode[], watched: boolean = true) => {
  togglingSeason.value = seasonId;
  try {
    // Filter episodes that need to be changed
    const targetEpisodes = episodes.filter(ep => ep.watched !== watched);
    for (const ep of targetEpisodes) {
      await handleToggleEpisode(ep.id, watched);
    }
  } finally {
    togglingSeason.value = null;
  }
};

onMounted(() => {
  if (props.seasons) {
    seasonsData.value = props.seasons.map(s => ({
      ...s,
      episodes: undefined,
    }));
  }
  loading.value = false;
});
</script>

<template>
  <section class="seasons-section py-8">
    <h2 class="text-2xl font-semibold text-foreground mb-6">Seasons</h2>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-card rounded-lg h-24"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive mb-4">{{ error }}</p>
      <button @click="$emit('retry')" class="px-4 py-2 bg-primary text-primary-foreground rounded">
        Retry
      </button>
    </div>

    <div v-else-if="seasonsData.length === 0" class="text-center py-8 text-muted-foreground">
      No seasons available
    </div>

    <div v-else class="space-y-3">
      <SeasonCard
        v-for="season in seasonsData"
        :key="season.id"
        :season="season"
        :is-expanded="expandedSeason === season.season_number"
        :episodes="season.episodes || []"
        :toggling-episode="togglingEpisode"
        :toggling-season="togglingSeason"
        @toggle="loadSeasonEpisodes"
        @toggle-episode="handleToggleEpisode"
        @toggle-season="handleToggleSeason"
      />
    </div>
  </section>
</template>
