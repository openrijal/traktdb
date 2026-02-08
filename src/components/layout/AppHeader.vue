<script setup lang="ts">
import OmniSearch from '@/components/search/OmniSearch.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import UserMenu from '@/components/layout/UserMenu.vue';

const props = defineProps<{ user?: { name?: string | null; image?: string | null; email?: string; }; }>();
</script>

<template>
    <header
        class="flex h-16 items-center gap-4 bg-background/80 px-6 justify-between border-b border-border/50 backdrop-blur"
    >
        <div class="flex flex-1 justify-center">
            <div class="w-full max-w-2xl">
                <OmniSearch />
            </div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <UserMenu :user="props.user" />
        </div>
    </header>
</template>
