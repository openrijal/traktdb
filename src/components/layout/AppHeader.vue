<script setup lang="ts">
import GlobalSearch from '@/components/search/GlobalSearch.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import UserMenu from '@/components/layout/UserMenu.vue';

const props = defineProps<{ user?: { name?: string | null; image?: string | null; email?: string; }; }>();
</script>

<template>
    <header class="flex h-14 items-center gap-4 bg-background px-6 justify-between">
        <div class="flex-1">
        </div>
        <div class="flex items-center gap-3">
            <GlobalSearch />
            <ThemeToggle />
            <UserMenu :user="props.user" />
        </div>
    </header>
</template>
