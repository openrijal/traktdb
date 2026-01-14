
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useBookStore } from '@/stores/books';
import { Bookmark, Check, BookOpen } from 'lucide-vue-next';
import { ReadStatus } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  googleId: string;
}>();

const store = useBookStore();

onMounted(() => {
  store.fetchStatus(props.googleId);
});

const status = computed(() => store.getStatus(props.googleId));

const isPlanToRead = computed(() => status.value === ReadStatus.PLAN_TO_READ);
const isReading = computed(() => status.value === ReadStatus.READING);
const isCompleted = computed(() => status.value === ReadStatus.COMPLETED);

const togglePlanToRead = () => {
  if (isPlanToRead.value) {
    store.updateStatus(props.googleId, null);
  } else {
    store.updateStatus(props.googleId, ReadStatus.PLAN_TO_READ);
  }
};

const toggleReading = () => {
  if (isReading.value) {
    store.updateStatus(props.googleId, null);
  } else {
    store.updateStatus(props.googleId, ReadStatus.READING);
  }
};

const toggleCompleted = () => {
  if (isCompleted.value) {
    store.updateStatus(props.googleId, null);
  } else {
    store.updateStatus(props.googleId, ReadStatus.COMPLETED);
  }
};

</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Plan to Read -->
    <Button @click.stop="togglePlanToRead" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isPlanToRead ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Want to Read">
      <Bookmark class="w-4 h-4" :class="{ 'fill-current': isPlanToRead }" />
    </Button>

    <!-- Reading -->
    <Button @click.stop="toggleReading" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isReading ? 'bg-amber-600 text-white hover:bg-amber-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Reading">
      <BookOpen class="w-4 h-4" />
    </Button>

    <!-- Completed -->
    <Button @click.stop="toggleCompleted" size="icon" variant="ghost" class="rounded-full h-8 w-8 transition-colors"
      :class="isCompleted ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'"
      title="Read">
      <Check class="w-4 h-4" />
    </Button>
  </div>
</template>
