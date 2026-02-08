
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import {
    Search as SearchIcon,
    Loader2,
    Film,
    Tv,
    Book,
    Headphones,
    LayoutGrid,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { MediaType } from '@/lib/constants';
import MediaCard from '@/components/media/MediaCard.vue';
import BookCard from '@/components/books/BookCard.vue';
import PodcastCard from '@/components/podcasts/PodcastCard.vue';
import { Input } from '@/components/ui/input';

interface OmniResult {
    id: string | number;
    title: string;
    subtitle?: string;
    image: string | null;
    media_type: string;
    url: string;
    year?: string;
    rating?: number;
}

interface OmniResponse {
    query: string;
    movies: OmniResult[];
    tv: OmniResult[];
    books: OmniResult[];
    podcasts: OmniResult[];
    totals: Record<string, number>;
}

type TabKey = 'all' | 'movies' | 'tv' | 'books' | 'podcasts';

const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'movies', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
    { key: 'books', label: 'Books', icon: Book },
    { key: 'podcasts', label: 'Podcasts', icon: Headphones },
];

const query = ref('');
const currentTab = ref<TabKey>('all');
const isLoading = ref(false);
const hasSearched = ref(false);
const omniResponse = ref<OmniResponse | null>(null);

// Per-category detailed results for individual tab views
const categoryResults = ref<Record<string, any[]>>({
    movies: [],
    tv: [],
    books: [],
    podcasts: [],
});
const categoryLoading = ref<Record<string, boolean>>({
    movies: false,
    tv: false,
    books: false,
    podcasts: false,
});
const categoryPage = ref<Record<string, number>>({
    movies: 1,
    tv: 1,
    books: 1,
    podcasts: 1,
});
const categoryHasMore = ref<Record<string, boolean>>({
    movies: true,
    tv: true,
    books: true,
    podcasts: true,
});

const tabCounts = computed(() => {
    if (!omniResponse.value) return {};
    return omniResponse.value.totals || {};
});

// Perform the omni search for the "All" overview
const performOmniSearch = async () => {
    if (!query.value || query.value.trim().length < 2) {
        omniResponse.value = null;
        hasSearched.value = false;
        return;
    }

    isLoading.value = true;
    hasSearched.value = true;

    try {
        const res = await fetch(
            `/api/search/omni?q=${encodeURIComponent(query.value)}&limit=6`,
        );
        if (res.ok) {
            omniResponse.value = await res.json();
            // Seed category results from omni data for quick tab switching
            if (omniResponse.value) {
                categoryResults.value.movies = convertMovies(omniResponse.value.movies);
                categoryResults.value.tv = convertTV(omniResponse.value.tv);
                categoryResults.value.books = convertBooks(omniResponse.value.books);
                categoryResults.value.podcasts = convertPodcasts(omniResponse.value.podcasts);
            }
        }
    } catch (e) {
        console.error('OmniSearch page error:', e);
    } finally {
        isLoading.value = false;
    }
};

// Convert omni results to card-compatible shapes
const convertMovies = (items: OmniResult[]) =>
    items.map((item) => ({
        id: Number(item.id),
        title: item.title,
        poster_path: item.image
            ? item.image.replace('https://image.tmdb.org/t/p/w500', '')
            : null,
        vote_average: item.rating || 0,
        release_date: item.year ? `${item.year}-01-01` : undefined,
        media_type: 'movie',
    }));

const convertTV = (items: OmniResult[]) =>
    items.map((item) => ({
        id: Number(item.id),
        name: item.title,
        poster_path: item.image
            ? item.image.replace('https://image.tmdb.org/t/p/w500', '')
            : null,
        vote_average: item.rating || 0,
        first_air_date: item.year ? `${item.year}-01-01` : undefined,
        media_type: 'tv',
    }));

const convertBooks = (items: OmniResult[]) =>
    items.map((item) => ({
        id: String(item.id),
        volumeInfo: {
            title: item.title,
            authors: item.subtitle ? [item.subtitle] : [],
            imageLinks: item.image
                ? { thumbnail: item.image }
                : undefined,
            publishedDate: item.year ? `${item.year}-01-01` : undefined,
            averageRating: item.rating,
        },
    }));

const convertPodcasts = (items: OmniResult[]) =>
    items.map((item) => ({
        id: String(item.id),
        collectionId: item.id,
        collectionName: item.title,
        artistName: item.subtitle || '',
        artworkUrl600: item.image || undefined,
    }));

// Dedicated category search for load-more within a single tab
const fetchCategoryPage = async (category: TabKey) => {
    if (category === 'all' || !query.value) return;

    const page = categoryPage.value[category];
    categoryLoading.value[category] = true;

    try {
        let url = '';
        const q = encodeURIComponent(query.value);
        const PER_PAGE = 20;

        switch (category) {
            case 'movies':
            case 'tv':
                url = `/api/search/multi?q=${q}&page=${page}`;
                break;
            case 'books':
                url = `/api/books/search?q=${q}&startIndex=${(page - 1) * PER_PAGE}`;
                break;
            case 'podcasts':
                url = `/api/podcasts/search?q=${q}&limit=${page * PER_PAGE}`;
                break;
        }

        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        switch (category) {
            case 'movies':
            case 'tv': {
                const filtered = (data.results || []).filter(
                    (r: any) => r.media_type === (category === 'movies' ? 'movie' : 'tv'),
                );
                const mapped = filtered.map((item: any) => ({
                    id: item.id,
                    title: item.title || item.name,
                    poster_path: item.poster_path,
                    vote_average: item.vote_average || 0,
                    release_date: item.release_date,
                    first_air_date: item.first_air_date,
                    media_type: item.media_type,
                    name: item.name,
                }));
                if (page === 1) {
                    categoryResults.value[category] = mapped;
                } else {
                    categoryResults.value[category] = [
                        ...categoryResults.value[category],
                        ...mapped,
                    ];
                }
                categoryHasMore.value[category] = filtered.length >= 5;
                break;
            }
            case 'books': {
                const books = (data.items || []).map((item: any) => ({
                    id: String(item.id),
                    volumeInfo: item.volumeInfo,
                }));
                if (page === 1) {
                    categoryResults.value.books = books;
                } else {
                    categoryResults.value.books = [
                        ...categoryResults.value.books,
                        ...books,
                    ];
                }
                const total = data.totalItems || 0;
                categoryHasMore.value.books = total
                    ? categoryResults.value.books.length < total
                    : books.length >= PER_PAGE;
                break;
            }
            case 'podcasts': {
                const podcasts = (data.results || []).map((item: any) => ({
                    id: item.id,
                    collectionId: item.itunesId || item.id,
                    collectionName: item.title,
                    artistName: item.publisher || '',
                    artworkUrl600: item.image || item.thumbnail || undefined,
                }));
                if (page === 1) {
                    categoryResults.value.podcasts = podcasts;
                } else {
                    const prev = categoryResults.value.podcasts.length;
                    const nextItems = podcasts.slice(prev);
                    categoryResults.value.podcasts = [
                        ...categoryResults.value.podcasts,
                        ...nextItems,
                    ];
                }
                const total = data.total || 0;
                categoryHasMore.value.podcasts = total
                    ? categoryResults.value.podcasts.length < total
                    : podcasts.length >= page * PER_PAGE;
                break;
            }
        }
    } catch (e) {
        console.error(`Search ${category} error:`, e);
    } finally {
        categoryLoading.value[category] = false;
    }
};

const loadMore = (category: TabKey) => {
    categoryPage.value[category]++;
    fetchCategoryPage(category);
};

const switchTab = (tab: TabKey) => {
    currentTab.value = tab;
    syncUrl();

    // Always fetch per-category data when switching to a specific tab
    if (tab !== 'all' && query.value.length >= 2) {
        categoryPage.value[tab] = 1;
        fetchCategoryPage(tab);
    }
};

const syncUrl = () => {
    const url = new URL(window.location.href);
    if (query.value) {
        url.searchParams.set('q', query.value);
    } else {
        url.searchParams.delete('q');
    }
    if (currentTab.value !== 'all') {
        url.searchParams.set('tab', currentTab.value);
    } else {
        url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
};

const debouncedSearch = useDebounceFn(() => {
    syncUrl();
    performOmniSearch();
    if (currentTab.value !== 'all' && query.value.length >= 2) {
        categoryPage.value[currentTab.value] = 1;
        fetchCategoryPage(currentTab.value);
    }
}, 300);

const handleInput = () => {
    if (query.value.length < 2) {
        omniResponse.value = null;
        hasSearched.value = false;
        return;
    }
    debouncedSearch();
};

// Section helpers for the "All" tab
const allSections = computed(() => {
    if (!omniResponse.value) return [];
    const sections: { key: TabKey; label: string; icon: any; items: any[] }[] = [];
    if (omniResponse.value.movies.length)
        sections.push({
            key: 'movies',
            label: 'Movies',
            icon: Film,
            items: categoryResults.value.movies,
        });
    if (omniResponse.value.tv.length)
        sections.push({
            key: 'tv',
            label: 'TV Shows',
            icon: Tv,
            items: categoryResults.value.tv,
        });
    if (omniResponse.value.books.length)
        sections.push({
            key: 'books',
            label: 'Books',
            icon: Book,
            items: categoryResults.value.books,
        });
    if (omniResponse.value.podcasts.length)
        sections.push({
            key: 'podcasts',
            label: 'Podcasts',
            icon: Headphones,
            items: categoryResults.value.podcasts,
        });
    return sections;
});

const totalResultsCount = computed(() => {
    if (!omniResponse.value) return 0;
    const t = omniResponse.value.totals;
    return (t.movies || 0) + (t.tv || 0) + (t.books || 0) + (t.podcasts || 0);
});

const skeletonCount = 12;

// Init from URL params
onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const tab = params.get('tab') as TabKey | null;

    if (q) {
        query.value = q;
    }
    if (tab && tabs.some((t) => t.key === tab)) {
        currentTab.value = tab;
    }

    if (query.value.length >= 2) {
        performOmniSearch();
        if (currentTab.value !== 'all') {
            categoryPage.value[currentTab.value] = 1;
            fetchCategoryPage(currentTab.value);
        }
    }
});
</script>

<template>
    <div class="w-full space-y-6">
        <!-- Search Input -->
        <div class="relative max-w-2xl mx-auto">
            <SearchIcon
                class="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none"
            />
            <Input
                type="search"
                v-model="query"
                @input="handleInput"
                placeholder="Search movies, TV shows, books, podcasts..."
                class="pl-12 h-12 text-lg bg-card/50 border-border rounded-xl focus-visible:ring-primary/50 transition-all shadow-lg"
                autofocus
            />
            <div v-if="isLoading" class="absolute right-4 top-4">
                <Loader2 class="h-5 w-5 animate-spin text-primary" />
            </div>
        </div>

        <!-- Results count -->
        <p
            v-if="hasSearched && !isLoading && omniResponse"
            class="text-sm text-muted-foreground text-center"
        >
            {{ totalResultsCount }} results for
            <span class="font-medium text-foreground">"{{ query }}"</span>
        </p>

        <!-- Category Tabs -->
        <div
            v-if="hasSearched && omniResponse"
            class="flex flex-wrap gap-2 justify-center"
        >
            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="switchTab(tab.key)"
                :class="
                    cn(
                        'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border',
                        currentTab === tab.key
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50',
                    )
                "
            >
                <component :is="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
                <span
                    v-if="tab.key !== 'all' && tabCounts[tab.key]"
                    class="ml-0.5 text-xs opacity-70"
                >
                    ({{ tabCounts[tab.key] }})
                </span>
            </button>
        </div>

        <!-- Loading Skeleton -->
        <div
            v-if="isLoading"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
            <div
                v-for="i in skeletonCount"
                :key="i"
                class="bg-muted animate-pulse rounded-lg aspect-[2/3]"
            />
        </div>

        <!-- "All" tab: sectioned results -->
        <template v-else-if="currentTab === 'all' && omniResponse && allSections.length > 0">
            <div v-for="section in allSections" :key="section.key" class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <component
                            :is="section.icon"
                            class="w-5 h-5 text-muted-foreground"
                        />
                        <h2 class="text-lg font-semibold text-foreground">
                            {{ section.label }}
                        </h2>
                    </div>
                    <button
                        @click="switchTab(section.key)"
                        class="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        View all →
                    </button>
                </div>

                <!-- Movies / TV grid -->
                <div
                    v-if="section.key === 'movies' || section.key === 'tv'"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                >
                    <MediaCard
                        v-for="item in section.items"
                        :key="item.id"
                        :media="item"
                        :type="section.key === 'tv' ? MediaType.TV : MediaType.MOVIE"
                    />
                </div>

                <!-- Books grid -->
                <div
                    v-else-if="section.key === 'books'"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                >
                    <BookCard
                        v-for="item in section.items"
                        :key="item.id"
                        :book="item"
                    />
                </div>

                <!-- Podcasts grid -->
                <div
                    v-else-if="section.key === 'podcasts'"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                >
                    <PodcastCard
                        v-for="item in section.items"
                        :key="item.collectionId"
                        :podcast="item"
                    />
                </div>
            </div>
        </template>

        <!-- Single category tab: full grid -->
        <template v-else-if="currentTab !== 'all' && hasSearched">
            <!-- Movies -->
            <div
                v-if="currentTab === 'movies'"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
                <MediaCard
                    v-for="item in categoryResults.movies"
                    :key="item.id"
                    :media="item"
                    :type="MediaType.MOVIE"
                />
            </div>

            <!-- TV -->
            <div
                v-if="currentTab === 'tv'"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
                <MediaCard
                    v-for="item in categoryResults.tv"
                    :key="item.id"
                    :media="item"
                    :type="MediaType.TV"
                />
            </div>

            <!-- Books -->
            <div
                v-if="currentTab === 'books'"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
                <BookCard
                    v-for="item in categoryResults.books"
                    :key="item.id"
                    :book="item"
                />
            </div>

            <!-- Podcasts -->
            <div
                v-if="currentTab === 'podcasts'"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
                <PodcastCard
                    v-for="item in categoryResults.podcasts"
                    :key="item.collectionId"
                    :podcast="item"
                />
            </div>

            <!-- Category loading -->
            <div
                v-if="categoryLoading[currentTab]"
                class="flex justify-center py-8"
            >
                <Loader2 class="h-6 w-6 animate-spin text-primary" />
            </div>

            <!-- Load More -->
            <div
                v-if="
                    !categoryLoading[currentTab] &&
                    categoryHasMore[currentTab] &&
                    categoryResults[currentTab].length > 0
                "
                class="flex justify-center pt-4"
            >
                <button
                    @click="loadMore(currentTab)"
                    class="px-6 py-2.5 text-sm font-medium text-primary border border-primary/50 rounded-full hover:bg-primary/10 transition-colors"
                >
                    Load more
                </button>
            </div>

            <!-- Empty category -->
            <div
                v-if="
                    !categoryLoading[currentTab] &&
                    categoryResults[currentTab].length === 0
                "
                class="text-center py-16 text-muted-foreground"
            >
                <component
                    :is="tabs.find((t) => t.key === currentTab)?.icon || SearchIcon"
                    class="w-12 h-12 mx-auto mb-4 opacity-20"
                />
                <p class="text-lg">No {{ tabs.find((t) => t.key === currentTab)?.label || '' }} found</p>
                <p class="text-sm mt-1">Try a different search term</p>
            </div>
        </template>

        <!-- No Results State -->
        <div
            v-else-if="hasSearched && !isLoading && omniResponse && totalResultsCount === 0"
            class="text-center py-20 text-muted-foreground"
        >
            <SearchIcon class="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 class="text-lg font-medium">No results found</h3>
            <p>Try adjusting your search query</p>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!hasSearched && !isLoading"
            class="text-center py-32 text-muted-foreground"
        >
            <SearchIcon class="w-20 h-20 mx-auto mb-6 opacity-10" />
            <h2 class="text-2xl font-semibold text-secondary-foreground mb-2">
                Search TracktDB
            </h2>
            <p class="max-w-md mx-auto text-muted-foreground">
                Find movies, TV shows, books, and podcasts to track. Start
                typing above.
            </p>
        </div>
    </div>
</template>
