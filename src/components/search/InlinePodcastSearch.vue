<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Search as SearchIcon, Loader2, Headphones, X, Plus } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Props {
    placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Search to add...',
});

const emit = defineEmits<{
    (e: 'select', item: any): void;
}>();

const query = ref('');
const results = ref<any[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const selectedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout>;

const handleInput = () => {
    clearTimeout(debounceTimer);
    selectedIndex.value = -1;
    
    if (query.value.length < 2) {
        results.value = [];
        isOpen.value = false;
        return;
    }

    isOpen.value = true;
    debounceTimer = setTimeout(() => {
        performSearch();
    }, 300);
};

const performSearch = async () => {
    if (!query.value) return;
    
    isLoading.value = true;

    try {
        const res = await fetch(`/api/podcasts/search?q=${encodeURIComponent(query.value)}&limit=8`);
        if (res.ok) {
            const data = await res.json();
            results.value = data.results || [];
        }
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false;
    }
};

const selectItem = (item: any) => {
    // Navigate to the podcast detail page
    window.location.href = `/podcasts/${item.collectionId}`;
    query.value = '';
    results.value = [];
    isOpen.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value || results.value.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex.value >= 0) {
                selectItem(results.value[selectedIndex.value]);
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

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    clearTimeout(debounceTimer);
});

const getArtwork = (podcast: any) => {
    return podcast.artworkUrl100 || podcast.artworkUrl60 || null;
};
</script>

<template>
    <div ref="containerRef" class="relative w-full max-w-sm">
        <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
                type="search" 
                v-model="query" 
                @input="handleInput"
                @keydown="handleKeydown"
                @focus="query.length >= 2 && (isOpen = true)"
                :placeholder="placeholder"
                class="pl-9 pr-8 h-10 bg-gray-900/50 border-gray-800 rounded-lg focus-visible:ring-indigo-500/50"
            />
            <button 
                v-if="query" 
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
                <X class="h-4 w-4" />
            </button>
            <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 class="h-4 w-4 animate-spin text-indigo-500" />
            </div>
        </div>

        <!-- Dropdown Results -->
        <div 
            v-if="isOpen && (results.length > 0 || isLoading)"
            class="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto"
        >
            <div v-if="isLoading && results.length === 0" class="p-4 text-center text-gray-400">
                <Loader2 class="h-5 w-5 animate-spin mx-auto" />
            </div>
            
            <button
                v-for="(item, index) in results"
                :key="item.collectionId"
                @click="selectItem(item)"
                :class="cn(
                    'w-full flex items-center gap-3 p-3 text-left hover:bg-gray-800/50 transition-colors',
                    selectedIndex === index && 'bg-gray-800/50'
                )"
            >
                <div class="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                        v-if="getArtwork(item)"
                        :src="getArtwork(item)!"
                        :alt="item.collectionName"
                        class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <Headphones class="w-5 h-5 text-gray-600" />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-white truncate">{{ item.collectionName }}</p>
                    <p class="text-sm text-gray-400 truncate">{{ item.artistName }}</p>
                </div>
                <Plus class="w-4 h-4 text-indigo-400 flex-shrink-0" />
            </button>
        </div>

        <!-- No Results -->
        <div 
            v-if="isOpen && !isLoading && query.length >= 2 && results.length === 0"
            class="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 p-4 text-center text-gray-400"
        >
            No podcasts found for "{{ query }}"
        </div>
    </div>
</template>
