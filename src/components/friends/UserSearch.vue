
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFriendStore } from '@/stores/friends';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import FriendCard from './FriendCard.vue';

const store = useFriendStore();
const searchQuery = ref('');

const debouncedSearch = useDebounceFn(async (q: string) => {
    await store.searchUsers(q);
}, 500);

watch(searchQuery, (newVal) => {
    if (newVal.length >= 3) {
        debouncedSearch(newVal);
    } else {
        store.searchResults = [];
    }
});
</script>

<template>
    <div class="space-y-6">
        <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input 
                v-model="searchQuery"
                placeholder="Search users by name or email (min 3 chars)..." 
                class="pl-10 bg-gray-900 border-gray-800 focus:border-indigo-500/50"
            />
            <div v-if="store.isSearching" class="absolute right-3 top-3">
                <Loader2 class="h-4 w-4 animate-spin text-indigo-500" />
            </div>
        </div>

        <div v-if="searchQuery.length >= 3" class="space-y-4">
            <h3 class="text-sm font-medium text-gray-400">Search Results</h3>
            
            <div v-if="store.searchResults.length > 0" class="grid gap-3">
                <FriendCard 
                    v-for="user in store.searchResults" 
                    :key="user.id" 
                    :user="user" 
                />
            </div>
            <div v-else-if="!store.isSearching" class="text-center py-8 text-gray-500">
                No users found matching "{{ searchQuery }}"
            </div>
        </div>
        
        <div v-else class="text-center py-12 text-gray-500 bg-gray-900/20 rounded-xl border border-dashed border-white/5">
            <Search class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Type at least 3 characters to search for users.</p>
        </div>
    </div>
</template>
