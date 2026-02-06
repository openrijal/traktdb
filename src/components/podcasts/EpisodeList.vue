<script setup lang="ts">
import { Play, Clock, Calendar } from 'lucide-vue-next';
import { format } from 'date-fns';

defineProps<{
    episodes: {
        id: number;
        title: string;
        description?: string | null;
        pubDate?: string | null;
        duration?: string | null;
        audioUrl?: string | null;
        episodeNumber?: number | null;
        seasonNumber?: number | null;
    }[];
}>();

const formatDuration = (input: string | null) => {
    if (!input) return '--:--';
    // If it's pure seconds (integer or string)
    if (/^\d+$/.test(input)) {
        const secs = parseInt(input);
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    // If it's already HH:MM:SS or similar, just return it
    return input;
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
        return '';
    }
};
</script>

<template>
    <div class="space-y-4">
        <h3 class="text-xl font-semibold mb-6">Episodes ({{ episodes.length }})</h3>

        <div class="grid gap-4">
            <div v-for="episode in episodes" :key="episode.id"
                class="group bg-card hover:bg-muted/50 border border-border rounded-xl p-4 transition-all duration-200">
                <div class="flex gap-4 items-start">
                    <!-- Play Button Placeholder -->
                    <button
                        class="mt-1 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Play class="w-5 h-5 ml-1" />
                    </button>

                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col gap-1">
                            <h4 class="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                                {{ episode.title }}
                            </h4>

                            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-2">
                                <span v-if="episode.pubDate" class="flex items-center gap-1">
                                    <Calendar class="w-3 h-3" />
                                    {{ formatDate(episode.pubDate) }}
                                </span>
                                <span v-if="episode.duration" class="flex items-center gap-1">
                                    <Clock class="w-3 h-3" />
                                    {{ formatDuration(episode.duration) }}
                                </span>
                            </div>

                            <p v-if="episode.description" class="text-sm text-muted-foreground line-clamp-2"
                                v-html="episode.description"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
