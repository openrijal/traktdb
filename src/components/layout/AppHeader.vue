<script setup lang="ts">
import OmniSearch from '@/components/search/OmniSearch.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import UserMenu from '@/components/layout/UserMenu.vue';

const props = defineProps<{ user?: { name?: string | null; image?: string | null; email?: string; }; }>();
</script>

<template>
    <header class="flex h-14 items-center gap-4 bg-background px-6 justify-between border-b border-border/50">
        <div class="flex-1 flex justify-center">
            <OmniSearch />
        </div>
        <div class="flex items-center gap-4 flex-shrink-0">
            <ThemeToggle />
            <UserMenu :user="props.user" />
        </div>
    </header>
</template>
