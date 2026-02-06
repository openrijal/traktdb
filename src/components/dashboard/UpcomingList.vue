<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UpcomingCarousel from '@/components/dashboard/UpcomingCarousel.vue';

const items = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchCalendar() {
  try {
    const response = await fetch('/api/trakt/calendar');
    if (!response.ok) {
      if (response.status === 401) {
        // Not connected or session expired
        error.value = "Connect Trakt to see your schedule.";
        return;
      }
      throw new Error('Failed to fetch calendar');
    }
    items.value = await response.json();
  } catch (e) {
    console.error(e);
    error.value = "Failed to load upcoming schedule.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchCalendar);
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold tracking-tight">Upcoming Schedule</h2>

    <div v-if="error"
      class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
      <span>{{ error }}</span>
      <a href="/settings" class="underline hover:text-destructive/80">Settings</a>
    </div>

    <UpcomingCarousel :items="items" :loading="loading" />
  </div>
</template>
