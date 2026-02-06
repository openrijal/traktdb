
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Search as SearchIcon, Loader2, Film, Tv, Book, Headphones, X, Clock } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { getTmdbImageUrl } from '@/lib/images';
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

interface CategorySection {
    key: string;
    label: string;
    icon: any;
    items: OmniResult[];
}

const RECENT_SEARCHES_KEY = 'omni-recent-searches';
const MAX_RECENT = 5;

const query = ref('');
const response = ref<OmniResponse | null>(null);
const isLoading = ref(false);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const recentSearches = ref<string[]>([]);

// Build flat list for keyboard nav
const categories = computed<CategorySection[]>(() => {
    if (!response.value) return [];
    const sections: CategorySection[] = [];
    if (response.value.movies.length) sections.push({ key: 'movies', label: 'Movies', icon: Film, items: response.value.movies });
    if (response.value.tv.length) sections.push({ key: 'tv', label: 'TV Shows', icon: Tv, items: response.value.tv });
    if (response.value.books.length) sections.push({ key: 'books', label: 'Books', icon: Book, items: response.value.books });
    if (response.value.podcasts.length) sections.push({ key: 'podcasts', label: 'Podcasts', icon: Headphones, items: response.value.podcasts });
    return sections;
});

const flatItems = computed(() => {
    const list: { item: OmniResult; category: string }[] = [];
    for (const cat of categories.value) {
        for (const item of cat.items) {
            list.push({ item, category: cat.key });
        }
    }
    return list;
});

const totalResults = computed(() => flatItems.value.length);

// Recent searches management
const loadRecent = () => {
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        recentSearches.value = stored ? JSON.parse(stored) : [];
    } catch {
        recentSearches.value = [];
    }
};

const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    recentSearches.value = [trimmed, ...recentSearches.value.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
    try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value)); } catch {}
};

const removeRecent = (term: string) => {
    recentSearches.value = recentSearches.value.filter((s) => s !== term);
    try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value)); } catch {}
};

// Search
const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
        response.value = null;
        return;
    }

    isLoading.value = true;
    isOpen.value = true;

    try {
        const res = await fetch(`/api/search/omni?q=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
            response.value = await res.json();
        }
    } catch (e) {
        console.error('OmniSearch error:', e);
    } finally {
        isLoading.value = false;
    }
};

const debouncedSearch = useDebounceFn((q: string) => performSearch(q), 300);

const handleInput = () => {
    selectedIndex.value = -1;
    if (query.value.length < 2) {
        response.value = null;
        return;
    }
    debouncedSearch(query.value);
};

const selectItem = (item: OmniResult) => {
    saveRecent(query.value);
    window.location.href = item.url;
    clearSearch();
};

const goToSearchPage = (tab?: string) => {
    if (query.value.length >= 2) {
        saveRecent(query.value);
        const tabParam = tab ? `&tab=${tab}` : '';
        window.location.href = `/search?q=${encodeURIComponent(query.value)}${tabParam}`;
        clearSearch();
    }
};

const selectRecent = (term: string) => {
    query.value = term;
    performSearch(term);
};

const handleKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value) {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToSearchPage();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex.value = Math.min(selectedIndex.value + 1, totalResults.value - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex.value >= 0 && flatItems.value[selectedIndex.value]) {
                selectItem(flatItems.value[selectedIndex.value].item);
            } else {
                goToSearchPage();
            }
            break;
        case 'Escape':
            isOpen.value = false;
            selectedIndex.value = -1;
            break;
    }
};

const clearSearch = () => {
    query.value = '';
    response.value = null;
    isOpen.value = false;
    selectedIndex.value = -1;
};

const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.value?.focus();
        isOpen.value = true;
    }
};

const handleFocus = () => {
    if (query.value.length >= 2 && response.value) {
        isOpen.value = true;
    } else if (query.value.length < 2 && recentSearches.value.length > 0) {
        isOpen.value = true;
    }
};

// Track global flat index per category item
const getFlatIndex = (catIdx: number, itemIdx: number): number => {
    let idx = 0;
    for (let c = 0; c < catIdx; c++) {
        idx += categories.value[c].items.length;
    }
    return idx + itemIdx;
};

onMounted(() => {
    loadRecent();
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
    <div ref="containerRef" class="relative w-full max-w-xl">
        <!-- Search Input -->
        <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                ref="inputRef"
                type="search"
                v-model="query"
                @input="handleInput"
                @keydown="handleKeydown"
                @focus="handleFocus"
                placeholder="Search movies, TV, books, podcasts... (⌘K)"
                class="pl-9 pr-8 h-9 bg-card/50 border-border rounded-lg focus-visible:ring-primary/50 text-sm w-full"
            />
            <button
                v-if="query"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X class="h-3.5 w-3.5" />
            </button>
            <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 class="h-4 w-4 animate-spin text-primary" />
            </div>
        </div>

        <!-- Dropdown -->
        <div
            v-if="isOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden max-h-[28rem] overflow-y-auto"
        >
            <!-- Recent searches (when no active query) -->
            <div v-if="!response && recentSearches.length > 0 && query.length < 2">
                <div class="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
                <button
                    v-for="term in recentSearches"
                    :key="term"
                    @click="selectRecent(term)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary/50 transition-colors text-sm"
                >
                    <Clock class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span class="flex-1 truncate text-foreground">{{ term }}</span>
                    <button
                        @click.stop="removeRecent(term)"
                        class="text-muted-foreground hover:text-foreground p-0.5"
                    >
                        <X class="h-3 w-3" />
                    </button>
                </button>
            </div>

            <!-- Loading state -->
            <div v-if="isLoading && !response" class="p-6 text-center text-muted-foreground">
                <Loader2 class="h-5 w-5 animate-spin mx-auto" />
            </div>

            <!-- Categorized results -->
            <template v-if="response && categories.length > 0">
                <div v-for="(cat, catIdx) in categories" :key="cat.key">
                    <!-- Category header -->
                    <div class="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border/50">
                        <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <component :is="cat.icon" class="h-3.5 w-3.5" />
                            {{ cat.label }}
                        </div>
                        <button
                            @click="goToSearchPage(cat.key)"
                            class="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            View all
                        </button>
                    </div>

                    <!-- Items -->
                    <button
                        v-for="(item, itemIdx) in cat.items"
                        :key="`${cat.key}-${item.id}`"
                        @click="selectItem(item)"
                        :class="cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary/50 transition-colors',
                            selectedIndex === getFlatIndex(catIdx, itemIdx) && 'bg-secondary/50'
                        )"
                    >
                        <!-- Thumbnail -->
                        <div :class="cn(
                            'flex-shrink-0 bg-secondary rounded overflow-hidden flex items-center justify-center',
                            cat.key === 'podcasts' ? 'w-9 h-9 rounded-md' : 'w-8 h-12 rounded'
                        )">
                            <img
                                v-if="item.image"
                                :src="item.image"
                                :alt="item.title"
                                class="w-full h-full object-cover"
                            />
                            <component
                                v-else
                                :is="cat.icon"
                                class="w-4 h-4 text-muted-foreground"
                            />
                        </div>

                        <!-- Text -->
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-foreground text-sm truncate">{{ item.title }}</p>
                            <p v-if="item.subtitle" class="text-xs text-muted-foreground truncate">{{ item.subtitle }}</p>
                        </div>

                        <!-- Year badge -->
                        <span v-if="item.year" class="text-xs text-muted-foreground flex-shrink-0">{{ item.year }}</span>
                    </button>
                </div>

                <!-- View all results -->
                <button
                    @click="goToSearchPage()"
                    class="w-full p-2.5 text-center text-sm text-primary hover:bg-secondary/50 transition-colors border-t border-border"
                >
                    View all results for "{{ query }}" →
                </button>
            </template>

            <!-- No results -->
            <div
                v-if="response && categories.length === 0 && !isLoading"
                class="p-6 text-center text-muted-foreground text-sm"
            >
                No results found for "{{ query }}"
            </div>
        </div>
    </div>
</template>
