<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Calendar, Loader2, RefreshCw } from 'lucide-vue-next';
import EpisodeCard from '@/components/calendar/EpisodeCard.vue';
import MovieCard from '@/components/calendar/MovieCard.vue';
import { formatDateHeader } from '@/lib/date';

interface CalendarDay {
  date: string;
  episodes: Episode[];
  movies: Movie[];
}

interface Episode {
  id: string;
  showTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  releaseDate: string;
  tmdbShowId: number;
}

interface Movie {
  id: string;
  movieTitle: string;
  releaseDate: string;
  tmdbMovieId: number;
}

interface CalendarResponse {
  success: boolean;
  data?: {
    days: CalendarDay[];
    fetchedAt: string;
  };
  error?: string;
}

const loading = ref(true);
const error = ref<string | null>(null);
const calendarData = ref<CalendarDay[]>([]);
const lastUpdated = ref<Date | null>(null);
const refreshing = ref(false);

const fetchCalendar = async (force = false) => {
  loading.value = !force;
  refreshing.value = force;
  error.value = null;

  try {
    const url = '/api/calendar/upcoming';
    const res = await fetch(url);
    const data: CalendarResponse = await res.json();

    if (data.success && data.data) {
      calendarData.value = data.data.days;
      lastUpdated.value = new Date(data.data.fetchedAt);
    } else {
      error.value = data.error || 'Failed to load calendar';
    }
  } catch (e) {
    error.value = 'Network error';
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const refresh = () => fetchCalendar(true);

onMounted(() => fetchCalendar());
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold tracking-tight">Upcoming Schedule</h2>
      <button
        @click="refresh"
        :disabled="loading || refreshing"
        class="p-2 rounded-lg hover:bg-muted transition-colors"
        title="Refresh calendar"
      >
        <Loader2 v-if="refreshing" class="w-5 h-5 animate-spin" />
        <RefreshCw v-else class="w-5 h-5" />
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <Loader2 class="w-10 h-10 animate-spin text-primary mb-2" />
      <p class="text-muted-foreground">Loading calendar...</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-destructive border border-destructive/20 rounded-lg bg-destructive/5">
      <Calendar class="w-10 h-10 mb-2 opacity-50" />
      <p>{{ error }}</p>
      <button @click="refresh" class="mt-2 text-sm underline">Retry</button>
    </div>

    <div v-else-if="calendarData.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-muted/20">
      <Calendar class="w-10 h-10 mb-2 opacity-50" />
      <p>No upcoming releases</p>
      <p class="text-xs text-muted-foreground/70">Add more shows and movies to see your schedule</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="day in calendarData" :key="day.date" class="space-y-3">
        <h3 class="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
          {{ formatDateHeader(day.date) }}
        </h3>
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <EpisodeCard
            v-for="episode in day.episodes"
            :key="episode.id"
            :episode="episode"
          />
          <MovieCard
            v-for="movie in day.movies"
            :key="movie.id"
            :movie="movie"
          />
        </div>
      </div>
    </div>

    <p v-if="lastUpdated" class="text-xs text-muted-foreground text-center">
      Last updated: {{ lastUpdated.toLocaleTimeString() }}
    </p>
  </div>
</template>
