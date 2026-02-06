<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UpcomingCarousel from '@/components/dashboard/UpcomingCarousel.vue';
import { getCalendarCache, setCalendarCache, clearCalendarCache } from '../../lib/calendar-cache';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-vue-next';

const items = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchCalendar(force = false) {
  loading.value = true;
  error.value = null;

  try {
    if (!force) {
      const cached = getCalendarCache();
      if (cached) {
        items.value = cached;
        loading.value = false;
        return;
      }
    }

    const response = await fetch('/api/trakt/calendar');
    if (!response.ok) {
      if (response.status === 401) {
        // Not connected or session expired
        clearCalendarCache();
        error.value = "Connect Trakt to see your schedule.";
        return;
      }
      throw new Error('Failed to fetch calendar');
    }
    const json = await response.json();
    if (json.success && json.data?.days) {
      items.value = json.data.days;
      setCalendarCache(json.data.days);
    } else {
      items.value = [];
    }
  } catch (e) {
    console.error(e);
    error.value = "Failed to load upcoming schedule.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchCalendar());
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold tracking-tight">Upcoming Schedule</h2>
      <Button variant="ghost" size="icon" @click="() => fetchCalendar(true)" class="refresh-button">
        <RefreshCw class="h-4 w-4" />
      </Button>
    </div>

    <div v-if="error"
      class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
      <span>{{ error }}</span>
      <a href="/settings" class="underline hover:text-destructive/80">Settings</a>
    </div>

    <UpcomingCarousel :items="items" :loading="loading" />
  </div>
</template>
