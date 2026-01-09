<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Library,
    Settings,
    LogOut,
    Search as SearchIcon
} from 'lucide-vue-next';
import { authClient } from '@/lib/auth-client';

const props = defineProps<{
    currentPath: string;
}>();

const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = '/login';
            },
        },
    });
};

const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Search', href: '/search', icon: SearchIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
];

function isActive(href: string) {
    if (href === '/dashboard' && props.currentPath === '/dashboard') return true;
    if (href !== '/dashboard' && props.currentPath.startsWith(href)) return true;
    return false;
}
</script>

<template>
    <div class="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
        <div class="p-6">
            <a href="/dashboard" class="flex items-center gap-2 font-bold text-xl">
                <span>Trackt<span class="text-primary">DB</span></span>
            </a>
        </div>

        <nav class="flex-1 px-4 space-y-2">
            <a v-for="link in links" :key="link.href" :href="link.href" :class="cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary',
                isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            )">
                <component :is="link.icon" class="h-4 w-4" />
                {{ link.name }}
            </a>
        </nav>

        <div class="p-4 border-t">
            <button @click="handleSignOut"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer">
                <LogOut class="h-4 w-4" />
                Sign Out
            </button>
        </div>
    </div>
</template>
