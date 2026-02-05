<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useLibraryStore } from '@/stores/library';
import { Bookmark, Check, Loader2 } from 'lucide-vue-next';
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

const toggleWatchlist = () => {
  if (isWatchlist.value) {
    store.updateStatus(props.tmdbId, props.type, null);
  } else {
    store.updateStatus(props.tmdbId, props.type, WatchStatus.PLAN_TO_WATCH);
  }
};

const markAllEpisodesWatched = async () => {
  if (props.type !== MediaType.TV) return;
  
  markingAllEpisodes.value = true;
  try {
    const response = await fetch('/api/library/mark-all-episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tvId: props.tmdbId,
        markWatched: true,
      }),
    });

    if (response.ok) {
      // Update the TV series status to completed
      store.updateStatus(props.tmdbId, props.type, WatchStatus.COMPLETED);
    }
  } catch (error) {
    console.error('Failed to mark all episodes as watched:', error);
  } finally {
    markingAllEpisodes.value = false;
  }
};

const toggleWatched = () => {
  if (isWatched.value) {
    store.updateStatus(props.tmdbId, props.type, null);
  } else {
    if (props.type === MediaType.TV) {
      markAllEpisodesWatched();
    } else {
      store.updateStatus(props.tmdbId, props.type, WatchStatus.COMPLETED);
    }
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
      :disabled="markingAllEpisodes"
      title="Mark as Watched">
      <Loader2 v-if="markingAllEpisodes" class="w-5 h-5 animate-spin" />
      <Check v-else class="w-5 h-5" />
    </Button>
  </div>
</template>
