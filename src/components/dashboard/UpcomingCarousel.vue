<script setup lang="ts">
import { ref, computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight } from 'lucide-vue-next';
import TmdbPoster from '@/components/common/TmdbPoster.vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface CalendarProps {
    items: any[];
    loading?: boolean;
}

const props = defineProps<CalendarProps>();

interface CalendarGroup {
    id: string;
    type: 'show' | 'movie';
    title: string;
    posterUrl: string | null;
    items: any[];
    upcomingDate: string;
    displayDate: string;
}

const selectedGroup = ref<CalendarGroup | null>(null);
const dialogOpen = ref(false);

function openDetail(group: CalendarGroup) {
    selectedGroup.value = group;
    dialogOpen.value = true;
}

const groups = computed(() => {
    if (!props.items || props.items.length === 0) return [];

    const grouped: CalendarGroup[] = [];
    const showMap = new Map<number, CalendarGroup>();

    const sortedItems = [...props.items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const item of sortedItems) {
        if (item.type === 'movie') {
            grouped.push({
                id: `movie-${item.ids.tmdb}`,
                type: 'movie',
                title: item.title,
                posterUrl: null,
                items: [item],
                upcomingDate: item.date,
                displayDate: formatDate(item.date)
            });
        } else {
            const showId = item.ids.tmdb;
            if (!showMap.has(showId)) {
                const group: CalendarGroup = {
                    id: `show-${showId}`,
                    type: 'show',
                    title: item.title,
                    posterUrl: null,
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

    return grouped.sort((a, b) => new Date(a.upcomingDate).getTime() - new Date(b.upcomingDate).getTime());
});

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
}

function formatEpisodeDate(dateStr: string) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
}

function formatRuntime(minutes: number | undefined) {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
</script>

<template>
    <div class="space-y-4">
        <div v-if="loading" class="flex gap-4 overflow-hidden">
            <div v-for="i in 4" :key="i" class="w-[140px] h-[210px] bg-muted animate-pulse rounded-lg shrink-0"></div>
        </div>

        <div v-else-if="groups.length === 0"
            class="py-8 text-center bg-muted/30 rounded-lg border border-border/50 border-dashed">
            <Calendar class="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <p class="text-muted-foreground text-sm">No upcoming releases found.</p>
        </div>

        <div v-else class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <div v-for="group in groups" :key="group.id" @click="openDetail(group)"
                class="snap-start shrink-0 w-[140px] group relative cursor-pointer motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg">
                <div class="aspect-[2/3] rounded-lg overflow-hidden bg-muted relative shadow-md">
                    <TmdbPoster :tmdb-id="group.items[0].ids.tmdb"
                        :type="group.type" class="w-full h-full object-cover" />

                    <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ChevronRight class="text-white w-8 h-8" />
                    </div>
                </div>

                <div class="mt-2 text-sm">
                    <h3 class="font-semibold text-foreground line-clamp-1 motion-safe:group-hover:text-primary motion-safe:transition-colors"
                        :title="group.title">{{ group.title }}</h3>
                    <p class="text-xs text-muted-foreground mt-1">{{ group.displayDate }}</p>
                </div>

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

        <!-- Detail Dialog -->
        <Dialog v-model:open="dialogOpen">
            <DialogContent v-if="selectedGroup" class="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{{ selectedGroup.title }}</DialogTitle>
                    <DialogDescription>
                        <span v-if="selectedGroup.type === 'show'">
                            {{ selectedGroup.items.length }} upcoming episode{{ selectedGroup.items.length > 1 ? 's' : '' }}
                        </span>
                        <span v-else>
                            Releasing {{ selectedGroup.displayDate }}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <!-- Show: Episode list -->
                <div v-if="selectedGroup.type === 'show'" class="space-y-3 mt-2">
                    <div v-for="ep in selectedGroup.items" :key="`${ep.season}-${ep.number}`"
                        class="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div class="shrink-0 w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {{ ep.number }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="font-medium text-sm line-clamp-1">
                                    {{ ep.episodeTitle || `Episode ${ep.number}` }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>S{{ String(ep.season).padStart(2, '0') }}E{{ String(ep.number).padStart(2, '0') }}</span>
                                <span>&middot;</span>
                                <span>{{ formatEpisodeDate(ep.date) }}</span>
                                <template v-if="formatRuntime(ep.runtime)">
                                    <span>&middot;</span>
                                    <span>{{ formatRuntime(ep.runtime) }}</span>
                                </template>
                            </div>
                            <p v-if="ep.overview" class="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {{ ep.overview }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Movie: Details -->
                <div v-else class="space-y-3 mt-2">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{{ selectedGroup.displayDate }}</span>
                        <template v-if="formatRuntime(selectedGroup.items[0]?.runtime)">
                            <span>&middot;</span>
                            <span>{{ formatRuntime(selectedGroup.items[0]?.runtime) }}</span>
                        </template>
                        <template v-if="selectedGroup.items[0]?.rating">
                            <span>&middot;</span>
                            <span>{{ selectedGroup.items[0].rating.toFixed(1) }} / 10</span>
                        </template>
                    </div>
                    <p v-if="selectedGroup.items[0]?.overview" class="text-sm text-muted-foreground">
                        {{ selectedGroup.items[0].overview }}
                    </p>
                    <p v-else class="text-sm text-muted-foreground italic">
                        No overview available.
                    </p>
                </div>

                <!-- View Details link -->
                <div class="mt-4 pt-3 border-t border-border">
                    <a :href="`/media/${selectedGroup.type === 'show' ? 'tv' : 'movie'}/${selectedGroup.items[0].ids.tmdb}`"
                        class="text-sm text-primary hover:underline font-medium">
                        View Full Details &rarr;
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
