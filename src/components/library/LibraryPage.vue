<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Clapperboard, Tv, Book, Tablet, Headphones, Search as SearchIcon } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import MediaCard from '@/components/media/MediaCard.vue';
import BookCard from '@/components/books/BookCard.vue';
import PodcastCard from '@/components/podcasts/PodcastCard.vue';
import {
    MediaType,
    WatchStatus,
    WatchStatusLabels,
    ReadStatus,
    ReadStatusLabels,
    ListenStatus,
    ListenStatusLabels,
} from '@/lib/constants';

const items = ref<any[]>([]);
const isLoading = ref(false);
const currentType = ref<MediaType>(MediaType.MOVIE);
const currentStatus = ref<string>('');

// Media type tabs
const mediaTabs = [
    { id: MediaType.MOVIE, label: 'Movies', icon: Clapperboard },
    { id: MediaType.TV, label: 'Series', icon: Tv },
    { id: MediaType.BOOK, label: 'Books', icon: Book },
    { id: MediaType.EBOOK, label: 'E-Books', icon: Tablet },
    { id: MediaType.PODCAST, label: 'Podcasts', icon: Headphones },
];

// Status tabs computed based on type
const statusTabs = computed(() => {
    switch (currentType.value) {
        case MediaType.MOVIE:
        case MediaType.TV:
            return [
                { id: WatchStatus.PLAN_TO_WATCH, label: WatchStatusLabels[WatchStatus.PLAN_TO_WATCH] },
                { id: WatchStatus.WATCHING, label: WatchStatusLabels[WatchStatus.WATCHING] },
                { id: WatchStatus.COMPLETED, label: WatchStatusLabels[WatchStatus.COMPLETED] },
                { id: WatchStatus.DROPPED, label: WatchStatusLabels[WatchStatus.DROPPED] },
            ];
        case MediaType.BOOK:
        case MediaType.EBOOK:
            return [
                { id: ReadStatus.READING, label: ReadStatusLabels[ReadStatus.READING] },
                { id: ReadStatus.PLAN_TO_READ, label: ReadStatusLabels[ReadStatus.PLAN_TO_READ] },
                { id: ReadStatus.COMPLETED, label: ReadStatusLabels[ReadStatus.COMPLETED] },
                { id: ReadStatus.DROPPED, label: ReadStatusLabels[ReadStatus.DROPPED] },
            ];
        case MediaType.PODCAST:
            return [
                { id: ListenStatus.LISTENING, label: ListenStatusLabels[ListenStatus.LISTENING] },
                { id: ListenStatus.PLAN_TO_LISTEN, label: ListenStatusLabels[ListenStatus.PLAN_TO_LISTEN] },
                { id: ListenStatus.COMPLETED, label: ListenStatusLabels[ListenStatus.COMPLETED] },
                { id: ListenStatus.DROPPED, label: ListenStatusLabels[ListenStatus.DROPPED] },
            ];
        default:
            return [];
    }
});

const getDefaultStatus = (type: MediaType): string => {
    switch (type) {
        case MediaType.MOVIE:
        case MediaType.TV:
            return WatchStatus.PLAN_TO_WATCH;
        case MediaType.BOOK:
        case MediaType.EBOOK:
            return ReadStatus.READING;
        case MediaType.PODCAST:
            return ListenStatus.LISTENING;
        default:
            return WatchStatus.PLAN_TO_WATCH;
    }
};

const activeStatusLabel = computed(() => {
    return statusTabs.value.find((t) => t.id === currentStatus.value)?.label || '';
});

const isPodcast = computed(() => currentType.value === MediaType.PODCAST);
const isBookType = computed(() => currentType.value === MediaType.BOOK || currentType.value === MediaType.EBOOK);
const isMediaType = computed(() => currentType.value === MediaType.MOVIE || currentType.value === MediaType.TV);

// Fetch items from API
const fetchItems = async () => {
    isLoading.value = true;
    items.value = [];

    try {
        const res = await fetch(`/api/library/items?type=${currentType.value}&status=${currentStatus.value}`);
        if (res.ok) {
            const data = await res.json();
            items.value = data.items || [];
        }
    } catch (e) {
        console.error('Library fetch error:', e);
    } finally {
        isLoading.value = false;
    }
};

// Tab switching
const switchType = (type: MediaType) => {
    currentType.value = type;
    currentStatus.value = getDefaultStatus(type);
    syncUrl();
    fetchItems();
};

const switchStatus = (status: string) => {
    currentStatus.value = status;
    syncUrl();
    fetchItems();
};

const syncUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', currentType.value);
    url.searchParams.set('status', currentStatus.value);
    window.history.replaceState({}, '', url.toString());
};

// Initialize from URL params
onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const statusParam = params.get('status');

    if (typeParam && Object.values(MediaType).includes(typeParam as MediaType)) {
        currentType.value = typeParam as MediaType;
    }

    currentStatus.value = statusParam || getDefaultStatus(currentType.value);
    fetchItems();
});

// Skeleton count for loading state
const skeletonCount = 12;
</script>

<template>
    <main class="min-h-screen pb-20">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 class="text-3xl font-bold text-foreground">My Library</h1>
            </div>

            <!-- Media Type Tabs -->
            <div class="flex flex-wrap gap-2 mb-8 bg-secondary/50 p-1 rounded-xl w-fit">
                <button v-for="tab in mediaTabs" :key="tab.id" @click="switchType(tab.id)" :class="cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    currentType === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )">
                    <component :is="tab.icon" class="w-4 h-4" />
                    {{ tab.label }}
                </button>
            </div>

            <!-- Status Tabs -->
            <div class="flex flex-wrap gap-3 mb-8">
                <button v-for="tab in statusTabs" :key="tab.id" @click="switchStatus(tab.id)" :class="cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all border',
                    currentStatus === tab.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50'
                )">
                    {{ tab.label }}
                </button>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="isLoading" :class="cn(
                'grid gap-4 md:gap-6',
                isPodcast
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            )">
                <div v-for="i in skeletonCount" :key="i" :class="cn(
                    'bg-muted animate-pulse rounded-lg',
                    isPodcast ? 'aspect-square' : 'aspect-[2/3]'
                )" />
            </div>

            <!-- Content Grid -->
            <template v-else-if="items.length > 0">
                <!-- Movies & TV -->
                <div v-if="isMediaType" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    <MediaCard v-for="item in items" :key="item.id" :media="item" :type="currentType" />
                </div>

                <!-- Books & eBooks -->
                <div v-else-if="isBookType"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    <BookCard v-for="item in items" :key="item.id" :book="item" />
                </div>

                <!-- Podcasts -->
                <div v-else-if="isPodcast"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    <PodcastCard v-for="item in items" :key="item.collectionId" :podcast="item" />
                </div>
            </template>

            <!-- Empty State -->
            <div v-else
                class="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl bg-muted/30">
                <SearchIcon class="w-12 h-12 mb-4 opacity-20" />
                <p class="text-lg mb-2">
                    No items found in your
                    <span class="text-primary font-medium">{{ activeStatusLabel }}</span>
                    list.
                </p>
                <!-- Removed duplicate search instruction/input if any -->
                <p class="text-muted-foreground text-sm">Use the global search bar to find something to add.</p>
            </div>
        </div>
    </main>
</template>
