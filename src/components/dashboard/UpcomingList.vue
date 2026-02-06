<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import UpcomingCarousel from '@/components/dashboard/UpcomingCarousel.vue';
import { Button } from '@/components/ui/button';
import { getCalendarCache, setCalendarCache, clearCalendarCache } from '@/lib/calendar-cache';

const items = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const lastUpdated = ref<number | null>(null);

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
        error.value = "Connect Trakt to see your schedule.";
        // Clear potential stale cache on auth error
        clearCalendarCache();
        return;
      }
      throw new Error('Failed to fetch calendar');
    }

    const data = await response.json();
    items.value = data;
    setCalendarCache(data);
    lastUpdated.value = Date.now();

  } catch (e) {
    console.error(e);
    error.value = "Failed to load upcoming schedule.";
  } finally {
    loading.value = false;
  }
}

function handleRefresh() {
  fetchCalendar(true);
}

onMounted(() => fetchCalendar());
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold tracking-tight">Upcoming Schedule</h2>
      <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary"
        @click="handleRefresh" :disabled="loading" title="Refresh Schedule">
        <RefreshCw :class="['w-4 h-4', { 'animate-spin': loading }]" />
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
