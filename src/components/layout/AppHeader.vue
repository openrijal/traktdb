<script setup lang="ts">
import GlobalSearch from "@/components/search/GlobalSearch.vue";
import { UserCircle } from 'lucide-vue-next';

const props = defineProps<{
    user?: {
        name?: string | null;
        image?: string | null;
        email?: string;
    };
}>();
</script>

<template>
    <header class="flex h-14 items-center gap-4 border-b bg-background px-6">
        <div class="flex-1">
            <GlobalSearch />
        </div>
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium hidden md:block">{{ props.user?.name || 'User' }}</span>
                <div
                    class="h-8 w-8 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/10">
                    <img v-if="props.user?.image" :src="props.user.image" alt="User"
                        class="h-full w-full object-cover" />
                    <UserCircle v-else class="h-5 w-5 text-primary" />
                </div>
            </div>
        </div>
    </header>
</template>
