<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLibraryStore } from '@/stores/library';
import { Bookmark, Check, Loader2 } from 'lucide-vue-next';
import { WatchStatus, MediaType } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  tmdbId: number;
  type: MediaType;
}>();

const store = useLibraryStore();

onMounted(() => {
  store.fetchStatus(props.tmdbId, props.type);
});

const status = computed(() => store.getStatus(props.tmdbId, props.type));
const isLoading = computed(() => store.isLoading);

const isWatchlist = computed(() => status.value === WatchStatus.PLAN_TO_WATCH);
const isWatched = computed(() => status.value === WatchStatus.COMPLETED);

const toggleWatchlist = () => {
  if (isWatchlist.value) {
    store.updateStatus(props.tmdbId, props.type, null); // Remove
  } else {
    store.updateStatus(props.tmdbId, props.type, WatchStatus.PLAN_TO_WATCH);
  }
};

const toggleWatched = () => {
  if (isWatched.value) {
    store.updateStatus(props.tmdbId, props.type, null); // Remove
  } else {
    store.updateStatus(props.tmdbId, props.type, WatchStatus.COMPLETED);
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
      title="Mark as Watched">
      <Check class="w-5 h-5" />
    </Button>
  </div>
</template>
