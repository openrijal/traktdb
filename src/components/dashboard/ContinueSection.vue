<script setup lang="ts">
import { ref } from 'vue';
import { Play } from 'lucide-vue-next';

// Placeholder data until we have real DB aggregation for "In Progress" items
const continueWatching = ref<any[]>([]); 
</script>

<template>
    <div class="space-y-4" v-if="continueWatching.length > 0">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">Continue Watching</h2>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <!-- Placeholder for Continue Watching Cards -->
            <div v-for="i in 3" :key="i"
                class="min-w-[250px] aspect-video bg-muted rounded-lg flex items-center justify-center relative group cursor-pointer overflow-hidden border border-border/50">
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <Play class="fill-white text-white w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />

                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <div class="text-sm font-medium text-white">Show Title</div>
                    <div class="text-xs text-gray-300">S1 E{{ i }} • Episode Title</div>
                    <div class="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-primary w-[45%]"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="py-8 text-center bg-muted/30 rounded-lg border border-border/50 border-dashed">
        <p class="text-muted-foreground">Start watching shows to see them here.</p>
    </div>
</template>
