<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useLibraryStore } from '@/stores/library';
import { Bookmark, Check, Loader2, XCircle } from 'lucide-vue-next';
import { WatchStatus, MediaType } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  tmdbId: number;
  type: MediaType;
  mediaItemId?: number;
}>();

const store = useLibraryStore();
const markingAllEpisodes = ref(false);

onMounted(() => {
  store.fetchStatus(props.tmdbId, props.type);
});

const status = computed(() => store.getStatus(props.tmdbId, props.type));
const isLoading = computed(() => store.isLoading);

const isWatchlist = computed(() => status.value === WatchStatus.PLAN_TO_WATCH);
const isWatched = computed(() => status.value === WatchStatus.COMPLETED);
const isDropped = computed(() => status.value === WatchStatus.DROPPED);

const toggleWatchlist = () => {
  if (isWatchlist.value) {
    store.updateStatus(props.tmdbId, props.type, null);
  } else {
    store.updateStatus(props.tmdbId, props.type, WatchStatus.PLAN_TO_WATCH);
  }
};

const toggleWatched = async () => {
  markingAllEpisodes.value = true;
  try {
    if (isWatched.value) {
      // Unmark: Move to PLAN_TO_WATCH
      // Backend automatically unmarks all episodes for TV shows
      await store.updateStatus(props.tmdbId, props.type, WatchStatus.PLAN_TO_WATCH);
    } else {
      // Mark: Move to COMPLETED
      // Backend automatically marks all episodes for TV shows
      await store.updateStatus(props.tmdbId, props.type, WatchStatus.COMPLETED);
    }
  } finally {
    markingAllEpisodes.value = false;
  }
};

const toggleDropped = () => {
  if (isDropped.value) {
    store.updateStatus(props.tmdbId, props.type, null);
  } else {
    store.updateStatus(props.tmdbId, props.type, WatchStatus.DROPPED);
  }
};
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Watchlist Button -->
    <Button @click.stop="toggleWatchlist" size="icon" variant="ghost" class="rounded-full transition-colors"
      :class="isWatchlist ? 'bg-primary text-foreground hover:bg-primary/90 hover:text-foreground' : 'bg-white/10 text-secondary-foreground hover:bg-white/20 hover:text-foreground'"
      title="Watchlist">
      <Bookmark class="w-5 h-5" :class="{ 'fill-current': isWatchlist }" />
    </Button>

    <!-- Watched Button -->
    <Button @click.stop="toggleWatched" size="icon" variant="ghost" class="rounded-full transition-colors"
      :class="isWatched ? 'bg-green-600 text-foreground hover:bg-green-700 hover:text-foreground' : 'bg-white/10 text-secondary-foreground hover:bg-white/20 hover:text-foreground'"
      :disabled="markingAllEpisodes" title="Mark as Watched">
      <Loader2 v-if="markingAllEpisodes" class="w-5 h-5 animate-spin" />
      <Check v-else class="w-5 h-5" />
    </Button>

    <!-- Dropped Button -->
    <Button @click.stop="toggleDropped" size="icon" variant="ghost" class="rounded-full transition-colors"
      :class="isDropped ? 'bg-red-600/20 text-red-500 hover:bg-red-600/30' : 'bg-white/10 text-secondary-foreground hover:bg-white/20 hover:text-foreground'"
      title="Mark as Dropped">
      <XCircle class="w-5 h-5" :class="{ 'fill-current': isDropped }" />
    </Button>
  </div>
</template>
