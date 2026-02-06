<script setup lang="ts">
import { ref, computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, Calendar } from 'lucide-vue-next';
import TmdbPoster from '@/components/common/TmdbPoster.vue';

interface CalendarProps {
    items: any[]; // The raw items from API
    loading?: boolean;
}

const props = defineProps<CalendarProps>();

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface CalendarGroup {
    id: string; // Composite key
    type: 'show' | 'movie';
    title: string;
    posterUrl: string | null;
    items: any[];
    upcomingDate: string; // ISO Date of the earliest item in group
    displayDate: string; // Formatted date string
}

const groups = computed(() => {
    if (!props.items || props.items.length === 0) return [];

    const grouped: CalendarGroup[] = [];
    const showMap = new Map<number, CalendarGroup>();

    // Sort items by date first (API should have sorted, but ensure)
    const sortedItems = [...props.items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const item of sortedItems) {
        if (item.type === 'movie') {
            // Movies are standalone groups (unless we support Collections later)
            grouped.push({
                id: `movie-${item.ids.tmdb}`,
                type: 'movie',
                title: item.title,
                posterUrl: null, // Image handled by TmdbPoster component using TMDB ID except for movies where we might have path if we fetched it. But we didn't. 
                // Ah, the calendar API from Trakt might NOT give the poster path directly if not extended. 
                // But wait, the previous plan assumed we use TMDB ID to get images. 
                // We don't have the path unless we fetch it. 
                // Or maybe we can lazily fetch or use a placeholders.
                // However, for now, let's assume we might not have the path and handle it.
                // WAIT! `getPosterPath` is tricky without fetching. 
                // The `media.ts` upsert logic FETCHES data. 
                // If we want instant display, we might need a client-side component that fetches the image by ID?
                // OR we can use the `tmdb-image` component if created? 

                // Let's defer image loading to a sub-component or just use a generic placeholder if missing.
                items: [item],
                upcomingDate: item.date,
                displayDate: formatDate(item.date)
            });
        } else {
            // Episodes: Group by Show TMDB ID
            // CHECK: Does Trakt return the Show ID? Yes `item.ids.tmdb`.
            const showId = item.ids.tmdb;
            if (!showMap.has(showId)) {
                const group: CalendarGroup = {
                    id: `show-${showId}`,
                    type: 'show',
                    title: item.title,
                    posterUrl: null, // We don't have it yet!
                    items: [],
                    upcomingDate: item.date,
                    displayDate: formatDate(item.date)
                };
                showMap.set(showId, group);
                grouped.push(group);
            }
            const group = showMap.get(showId)!;
            group.items.push(item);
        }
    }

    // Resort groups by their earliest upcoming date
    return grouped.sort((a, b) => new Date(a.upcomingDate).getTime() - new Date(b.upcomingDate).getTime());
});

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
}

// Helper to construct image URL - NOTE: We don't have the path in the calendar response sadly unless we fetch.
// We really need a component that takes ID and type and renders the image.
// I'll assume we can't get the path synchronously.
</script>

<template>
    <div class="space-y-4">
        <div v-if="loading" class="flex gap-4 overflow-hidden">
            <!-- Skeletons -->
            <div v-for="i in 4" :key="i" class="w-[140px] h-[210px] bg-muted animate-pulse rounded-lg shrink-0"></div>
        </div>

        <div v-else-if="groups.length === 0"
            class="py-8 text-center bg-muted/30 rounded-lg border border-border/50 border-dashed">
            <Calendar class="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <p class="text-muted-foreground text-sm">No upcoming releases found.</p>
        </div>

        <div v-else class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <div v-for="group in groups" :key="group.id"
                class="snap-start shrink-0 w-[140px] group relative cursor-pointer transition-transform hover:scale-105">
                <div class="aspect-[2/3] rounded-lg overflow-hidden bg-muted relative shadow-md">
                    <!-- Image Handling: Since we only have ID, we need a component to fetch/display image -->
                    <!-- For now, I'll use a placeholder or a dedicated async image component if available. -->
                    <!-- I will create a simple TmdbPoster component inline or separate if needed. -->
                    <!-- Actually, I can use the `/api/media/...` or direct TMDB fetch in a child component. -->
                    <TmdbPoster :tmdb-id="group.type === 'show' ? group.items[0].ids.tmdb : group.items[0].ids.tmdb"
                        :type="group.type" class="w-full h-full object-cover" />

                    <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ChevronRight class="text-white w-8 h-8" />
                    </div>
                </div>

                <div class="mt-2 text-sm">
                    <h3 class="font-medium leading-none truncate" :title="group.title">{{ group.title }}</h3>
                    <p class="text-xs text-muted-foreground mt-1">{{ group.displayDate }}</p>
                </div>

                <!-- Bagdes -->
                <div class="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge v-if="group.items.length > 1" variant="secondary"
                        class="text-[10px] h-5 px-1.5 shadow-sm bg-background/80 backdrop-blur-sm">
                        {{ group.items.length }} Eps
                    </Badge>
                    <Badge v-if="group.type === 'movie'"
                        class="text-[10px] h-5 px-1.5 shadow-sm bg-primary/80 backdrop-blur-sm">
                        Movie
                    </Badge>
                </div>
            </div>
        </div>
    </div>
</template>
