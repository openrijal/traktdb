<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search as SearchIcon, Loader2, Film, Tv } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const query = ref('');
const results = ref<any[]>([]);
const isLoading = ref(false);
const showResults = ref(false);
let debounceTimer: ReturnType<typeof setTimeout>;

const handleInput = () => {
    clearTimeout(debounceTimer);
    if (query.value.length < 2) {
        results.value = [];
        showResults.value = false;
        return;
    }

    debounceTimer = setTimeout(async () => {
        isLoading.value = true;
        try {
            const res = await fetch(`/api/search/multi?q=${encodeURIComponent(query.value)}`);
            if (res.ok) {
                const data = await res.json();
                results.value = data.results;
                showResults.value = true;
            }
        } catch (e) {
            console.error(e);
        } finally {
            isLoading.value = false;
        }
    }, 300);
};

const formatType = (type: string) => type === 'tv' ? 'TV Show' : 'Movie';

const onBlur = () => {
    setTimeout(() => {
        showResults.value = false;
    }, 200);
}
</script>

<template>
    <div class="relative w-full max-w-md group">
        <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input type="search" v-model="query" @input="handleInput" @focus="query.length >= 2 && (showResults = true)"
            @blur="onBlur" placeholder="Search movies, tv shows..." :class="cn(
                'flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 pl-9 text-sm shadow-sm transition-colors',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            )" />
        <div v-if="isLoading" class="absolute right-2.5 top-2.5">
            <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
        </div>

        <!-- Dropdown -->
        <div v-if="showResults && results.length > 0"
            class="absolute top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden">
            <div class="p-1">
                <a v-for="item in results" :key="item.id" :href="`/media/${item.media_type}/${item.id}`"
                    class="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer group/item">
                    <div class="h-10 w-7 shrink-0 rounded overflow-hidden bg-muted">
                        <img v-if="item.poster_path" :src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
                            class="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div class="flex flex-col flex-1 min-w-0">
                        <span class="font-medium truncate">{{ item.title }}</span>
                        <div class="flex items-center gap-2 text-xs text-muted-foreground">
                            <span class="capitalize flex items-center gap-1">
                                <Film v-if="item.media_type === 'movie'" class="h-3 w-3" />
                                <Tv v-else class="h-3 w-3" />
                                {{ formatType(item.media_type) }}
                            </span>
                            <span v-if="item.year">• {{ item.year }}</span>
                        </div>
                    </div>
                </a>
            </div>
            <div class="border-t p-1">
                <a :href="`/search?q=${query}`"
                    class="block w-full text-center text-xs p-2 hover:bg-muted text-muted-foreground rounded-sm">
                    View all results for "{{ query }}"
                </a>
            </div>
        </div>
    </div>
</template>
