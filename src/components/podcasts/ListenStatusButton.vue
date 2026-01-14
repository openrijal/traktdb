
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePodcastStore } from '@/stores/podcasts';
import { Bookmark, Check, Headphones } from 'lucide-vue-next';
import { ListenStatus } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  itunesId: string;
}>();

const store = usePodcastStore();

onMounted(() => {
  store.fetchStatus(props.itunesId);
});

const status = computed(() => store.getStatus(props.itunesId));

const isPlanToListen = computed(() => status.value === ListenStatus.PLAN_TO_LISTEN);
const isListening = computed(() => status.value === ListenStatus.LISTENING);
const isCompleted = computed(() => status.value === ListenStatus.COMPLETED);

const togglePlanToListen = () => {
  if (isPlanToListen.value) {
    store.updateStatus(props.itunesId, null);
  } else {
    store.updateStatus(props.itunesId, ListenStatus.PLAN_TO_LISTEN);
  }
};

const toggleListening = () => {
  if (isListening.value) {
    store.updateStatus(props.itunesId, null);
  } else {
    store.updateStatus(props.itunesId, ListenStatus.LISTENING);
  }
};

const toggleCompleted = () => {
  if (isCompleted.value) {
    store.updateStatus(props.itunesId, null);
  } else {
    store.updateStatus(props.itunesId, ListenStatus.COMPLETED);
  }
};

</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Plan to Listen -->
    <Button @click.stop="togglePlanToListen" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isPlanToListen ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Want to Listen">
      <Bookmark class="w-4 h-4" :class="{ 'fill-current': isPlanToListen }" />
    </Button>

    <!-- Listening -->
    <Button @click.stop="toggleListening" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isListening ? 'bg-amber-600 text-white hover:bg-amber-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Listening">
      <Headphones class="w-4 h-4" />
    </Button>

    <!-- Completed -->
    <Button @click.stop="toggleCompleted" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isCompleted ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Listened">
      <Check class="w-4 h-4" />
    </Button>
  </div>
</template>
