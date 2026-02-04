<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Search as SearchIcon, Loader2, Film, Tv, X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { MediaType } from '@/lib/constants';
import { Input } from '@/components/ui/input';

interface SearchResult {
    id: number;
    title: string;
    media_type: string;
    poster_path: string | null;
    year: string;
}

const query = ref('');
const results = ref<SearchResult[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
        results.value = [];
        isOpen.value = false;
        return;
    }

    isLoading.value = true;
    isOpen.value = true;

    try {
        const res = await fetch(`/api/search/multi?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
            const data = await res.json();
            results.value = data.results;
        }
    } catch (e) {
        console.error('Global search error:', e);
    } finally {
        isLoading.value = false;
    }
};

const debouncedSearch = useDebounceFn((q: string) => {
    performSearch(q);
}, 300);

const handleInput = () => {
    selectedIndex.value = -1;
    if (query.value.length < 2) {
        results.value = [];
        isOpen.value = false;
        return;
    }
    debouncedSearch(query.value);
};

const selectItem = (item: SearchResult) => {
    window.location.href = `/media/${item.media_type}/${item.id}`;
    clearSearch();
};

const goToSearchPage = () => {
    if (query.value.length >= 2) {
        window.location.href = `/search?q=${encodeURIComponent(query.value)}`;
        clearSearch();
    }
};

const handleKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value || results.value.length === 0) {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToSearchPage();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex.value >= 0) {
                selectItem(results.value[selectedIndex.value]);
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
    results.value = [];
    isOpen.value = false;
    selectedIndex.value = -1;
};

const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
};

const getPosterUrl = (path: string | null) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/w92${path}`;
};

// Keyboard shortcut: Ctrl+K or Cmd+K to focus search
const handleGlobalKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.value?.focus();
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
    <div ref="containerRef" class="relative w-full max-w-xs md:max-w-sm">
        <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                ref="inputRef"
                type="search"
                v-model="query"
                @input="handleInput"
                @keydown="handleKeydown"
                @focus="query.length >= 2 && (isOpen = true)"
                placeholder="Search... (⌘K)"
                class="pl-9 pr-8 h-9 bg-gray-900/50 border-gray-800 rounded-lg focus-visible:ring-indigo-500/50 text-sm"
            />
            <button
                v-if="query"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
                <X class="h-3.5 w-3.5" />
            </button>
            <div v-if="isLoading && !query" class="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 class="h-4 w-4 animate-spin text-indigo-500" />
            </div>
        </div>

        <!-- Dropdown Results -->
        <div
            v-if="isOpen && (results.length > 0 || isLoading)"
            class="absolute top-full left-0 right-0 mt-1.5 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto"
        >
            <div v-if="isLoading && results.length === 0" class="p-4 text-center text-gray-400">
                <Loader2 class="h-5 w-5 animate-spin mx-auto" />
            </div>

            <button
                v-for="(item, index) in results"
                :key="item.id"
                @click="selectItem(item)"
                :class="cn(
                    'w-full flex items-center gap-3 p-2.5 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0',
                    selectedIndex === index && 'bg-gray-800/50'
                )"
            >
                <div class="w-8 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img
                        v-if="getPosterUrl(item.poster_path)"
                        :src="getPosterUrl(item.poster_path)!"
                        :alt="item.title"
                        class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <Film v-if="item.media_type === 'movie'" class="w-4 h-4 text-gray-600" />
                        <Tv v-else class="w-4 h-4 text-gray-600" />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-white text-sm truncate">{{ item.title }}</p>
                    <div class="flex items-center gap-1.5 text-xs text-gray-400">
                        <span class="uppercase tracking-wide">{{ item.media_type === 'tv' ? 'TV' : 'Movie' }}</span>
                        <span>·</span>
                        <span>{{ item.year }}</span>
                    </div>
                </div>
            </button>

            <!-- View all results link -->
            <button
                v-if="results.length > 0"
                @click="goToSearchPage"
                class="w-full p-2.5 text-center text-sm text-indigo-400 hover:bg-gray-800/50 transition-colors border-t border-gray-800"
            >
                View all results →
            </button>
        </div>

        <!-- No Results -->
        <div
            v-if="isOpen && !isLoading && query.length >= 2 && results.length === 0"
            class="absolute top-full left-0 right-0 mt-1.5 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 p-4 text-center text-gray-400 text-sm"
        >
            No results found for "{{ query }}"
        </div>
    </div>
</template>
