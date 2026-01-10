<script setup lang="ts">
import { ref } from 'vue';
import { Calendar } from 'lucide-vue-next';

// Placeholder until we implement the "Upcoming" query
const upcoming = ref<any[]>([]); 
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">Upcoming Schedule</h2>
        </div>

        <div class="space-y-2">
            <div v-if="upcoming.length === 0"
                class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-muted/20">
                <Calendar class="w-10 h-10 mb-2 opacity-50" />
                <p>No upcoming episodes found.</p>
                <p class="text-xs text-muted-foreground/70">Track more TV shows to populate your schedule.</p>
            </div>

            <div v-else class="grid gap-2">
                <!-- List Items would go here -->
            </div>
        </div>
    </div>
</template>
