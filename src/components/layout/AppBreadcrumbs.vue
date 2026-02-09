<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ChevronRight, ArrowLeft } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps<{ currentPath: string }>();

const activePath = ref(props.currentPath);

const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    library: 'Library',
    movies: 'Movies',
    shows: 'Shows',
    tv: 'TV Shows',
    movie: 'Movie',
    books: 'Books',
    ebooks: 'E-Books',
    podcasts: 'Podcasts',
    media: 'Discover',
    search: 'Search',
    friends: 'Friends',
    profile: 'Profile',
    settings: 'Settings',
};

const isIdSegment = (segment: string) => /^(\d+|[a-f0-9-]{10,})$/i.test(segment);

const breadcrumbs = computed(() => {
    const segments = activePath.value.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let path = '';

    segments.forEach((segment, index) => {
        path += `/${segment}`;
        const label = labelMap[segment] || (isIdSegment(segment) ? 'Details' : segment.replace(/-/g, ' '));
        crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: path });
    });

    if (crumbs.length === 0) {
        crumbs.push({ label: 'Dashboard', href: '/dashboard' });
    }

    return crumbs;
});

const showLibraryBack = computed(() => {
    const segments = activePath.value.split('/').filter(Boolean);
    return segments[0] === 'library' && segments.length > 1;
});

const handleNavEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail as { path?: string } | undefined;
    if (detail?.path) {
        activePath.value = detail.path;
    } else {
        activePath.value = window.location.pathname;
    }
};

onMounted(() => {
    if (typeof window !== 'undefined') {
        activePath.value = window.location.pathname;
        window.addEventListener('app:navigation', handleNavEvent as EventListener);
        window.addEventListener('popstate', handleNavEvent as EventListener);
    }
});

onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('app:navigation', handleNavEvent as EventListener);
        window.removeEventListener('popstate', handleNavEvent as EventListener);
    }
});
</script>

<template>
    <div class="border-b border-border/50 bg-card/40 backdrop-blur">
        <div class="flex items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-muted-foreground">
                <template v-for="(crumb, index) in breadcrumbs" :key="crumb.href">
                    <a :href="crumb.href" :class="cn(
                        'transition hover:text-foreground',
                        index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )">
                        {{ crumb.label }}
                    </a>
                    <ChevronRight v-if="index < breadcrumbs.length - 1" class="h-3.5 w-3.5 opacity-60" />
                </template>
            </nav>
        </div>
    </div>
</template>
