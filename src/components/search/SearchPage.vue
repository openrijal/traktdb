
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search as SearchIcon, Loader2, Film, Tv } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { MediaType } from '@/lib/constants';
import MediaCard from '@/components/media/MediaCard.vue';
import { Input } from '@/components/ui/input';

const query = ref('');
const results = ref<any[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);
let debounceTimer: ReturnType<typeof setTimeout>;

// Initialize with URL param if present
onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        query.value = q;
        performSearch();
    }
});

const handleInput = () => {
    clearTimeout(debounceTimer);
    if (query.value.length < 2) {
        results.value = [];
        hasSearched.value = false;
        return;
    }

    debounceTimer = setTimeout(() => {
        performSearch();
    }, 300);
};

const performSearch = async () => {
    if (!query.value) return;
    
    isLoading.value = true;
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('q', query.value);
    window.history.replaceState({}, '', url);

    try {
        const res = await fetch(`/api/search/multi?q=${encodeURIComponent(query.value)}`);
        if (res.ok) {
            const data = await res.json();
            results.value = data.results;
        }
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false;
        hasSearched.value = true;
    }
};

const formatType = (type: string) => type === MediaType.TV ? 'TV Show' : 'Movie';
</script>

<template>
    <div class="w-full space-y-8">
        <!-- Search Input -->
        <div class="relative max-w-2xl mx-auto">
            <SearchIcon class="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input 
                type="search" 
                v-model="query" 
                @input="handleInput" 
                placeholder="Search movies, tv shows..." 
                class="pl-12 h-12 text-lg bg-card/50 border-border rounded-xl focus-visible:ring-primary/50 transition-all shadow-lg"
                autofocus
            />
            <div v-if="isLoading" class="absolute right-4 top-4">
                <Loader2 class="h-5 w-5 animate-spin text-primary" />
            </div>
        </div>

        <!-- Results Grid -->
        <div v-if="results.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MediaCard 
                v-for="item in results" 
                :key="item.id" 
                :media="item" 
                :type="item.media_type || item.type"
            />
        </div>

        <!-- No Results State -->
        <div v-else-if="hasSearched && !isLoading" class="text-center py-20 text-muted-foreground">
            <Film class="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 class="text-lg font-medium text-muted-foreground">No results found</h3>
            <p>Try adjusting your search query</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!hasSearched && !isLoading" class="text-center py-32 text-muted-foreground">
            <SearchIcon class="w-20 h-20 mx-auto mb-6 opacity-10" />
            <h2 class="text-2xl font-semibold text-secondary-foreground mb-2">Search TracktDB</h2>
            <p class="max-w-md mx-auto text-muted-foreground">Find movies and TV shows to track. Just start typing above.</p>
        </div>
    </div>
</template>
