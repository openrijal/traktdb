<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLibraryStore } from '@/stores/library';
import { Bookmark, Check, Loader2 } from 'lucide-vue-next';
import { WatchStatus, MediaType } from '@/lib/constants';

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
    <button @click.stop="toggleWatchlist"
      class="p-2 rounded-full transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
      :class="isWatchlist ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white/10 text-gray-300 hover:bg-white/20'"
      title="Watchlist">
      <Bookmark class="w-5 h-5" :class="{ 'fill-current': isWatchlist }" />
    </button>

    <!-- Watched Button -->
    <button @click.stop="toggleWatched"
      class="p-2 rounded-full transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
      :class="isWatched ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white/10 text-gray-300 hover:bg-white/20'"
      title="Mark as Watched">
      <Check class="w-5 h-5" />
    </button>
  </div>
</template>
