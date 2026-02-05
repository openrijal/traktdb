<script setup lang="ts">
import { UserCircle } from 'lucide-vue-next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GlobalSearch from '@/components/search/GlobalSearch.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';

const props = defineProps<{ user?: { name?: string | null; image?: string | null; email?: string; }; }>();
</script>

<template>
    <header class="flex h-14 items-center gap-4 bg-background px-6 justify-between">
        <div class="flex-1">
        </div>
        <div class="flex items-center gap-4">
            <GlobalSearch />
            <ThemeToggle />
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium hidden md:block">{{ props.user?.name || 'User' }}</span>
                <Avatar class="h-8 w-8 border border-primary/10">
                    <AvatarImage v-if="props.user?.image" :src="props.user.image" :alt="props.user.name || 'User'" />
                    <AvatarFallback class="bg-primary/20">
                        <UserCircle class="h-5 w-5 text-primary" />
                    </AvatarFallback>
                </Avatar>
            </div>
        </div>
    </header>
</template>
