<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Library,
    Book,
    Headphones,
    Users,
    Clapperboard,
    Tv,
    Tablet,
    ChevronDown
} from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
    currentPath: string;
}>();

const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Friends', href: '/friends', icon: Users },
];

const libraryLinks = [
    { name: 'Movies', href: '/library/movies', icon: Clapperboard },
    { name: 'Shows', href: '/library/shows', icon: Tv },
    { name: 'Podcasts', href: '/library/podcasts', icon: Headphones },
    { name: 'Books', href: '/library/books', icon: Book },
    { name: 'E-Books', href: '/library/ebooks', icon: Tablet },
];

const isLibraryOpen = ref(true);

function isActive(href: string) {
    if (href === '/dashboard' && props.currentPath === '/dashboard') return true;
    if (href !== '/dashboard' && props.currentPath.startsWith(href)) return true;
    return false;
}
</script>

<template>
    <aside class="flex h-full w-72 flex-col border-r border-border/50 bg-card/70 text-card-foreground backdrop-blur">
        <div class="px-6 pb-6 pt-8">
            <a href="/dashboard" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span class="text-foreground">Trackt<span class="text-primary">DB</span></span>
            </a>
            <p class="mt-2 text-xs text-muted-foreground">Your media command center</p>
        </div>

        <nav class="flex-1 px-4 pb-6 overflow-y-auto">
            <div class="space-y-2">
                <a v-for="link in links" :key="link.href" :href="link.href" :class="cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary',
                    isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/60'
                )">
                    <component :is="link.icon" class="h-4 w-4" />
                    {{ link.name }}
                </a>
            </div>

            <div class="mt-6">
                <div class="flex items-center justify-between pr-3">
                    <a href="/library/movies" :class="cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary',
                        props.currentPath.startsWith('/library') ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/60'
                    )">
                        <Library class="h-4 w-4" />
                        Library
                    </a>
                    <button class="rounded-md p-1 text-muted-foreground transition hover:text-foreground" type="button"
                        :aria-expanded="isLibraryOpen" aria-label="Toggle library menu"
                        @click="isLibraryOpen = !isLibraryOpen">
                        <ChevronDown class="h-4 w-4 transition-transform"
                            :class="isLibraryOpen ? 'rotate-0' : '-rotate-90'" />
                    </button>
                </div>

                <div v-show="isLibraryOpen" class="mt-2 space-y-1 pl-8">
                    <a v-for="link in libraryLinks" :key="link.href" :href="link.href" :class="cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all',
                        isActive(link.href)
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )">
                        <component :is="link.icon" class="h-3.5 w-3.5" />
                        {{ link.name }}
                    </a>
                </div>
            </div>
        </nav>
    </aside>
</template>
