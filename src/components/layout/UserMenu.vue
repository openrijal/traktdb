<script setup lang="ts">
import { computed } from 'vue';
import { User, Settings, LogOut } from 'lucide-vue-next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

const props = defineProps<{
    user?: {
        name?: string | null;
        image?: string | null;
        email?: string;
    };
}>();

const initials = computed(() => {
    const name = props.user?.name;
    if (!name) return '';
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
});

const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                window.location.href = '/login';
            },
        },
    });
};
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <button
                class="relative flex h-8 w-8 items-center justify-center rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="User menu"
            >
                <Avatar class="h-8 w-8 border border-primary/10">
                    <AvatarImage
                        v-if="props.user?.image"
                        :src="props.user.image"
                        :alt="props.user?.name || 'User'"
                    />
                    <AvatarFallback class="bg-primary/20 text-xs font-medium text-primary">
                        <span v-if="initials">{{ initials }}</span>
                        <User v-else class="h-4 w-4 text-primary" />
                    </AvatarFallback>
                </Avatar>
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent class="w-56">
            <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col gap-1">
                    <p class="text-sm font-medium leading-none">{{ props.user?.name || 'User' }}</p>
                    <p v-if="props.user?.email" class="text-xs leading-none text-muted-foreground">
                        {{ props.user.email }}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as="a" href="/profile">
                <User class="h-4 w-4" />
                Profile
            </DropdownMenuItem>
            <DropdownMenuItem as="a" href="/settings">
                <Settings class="h-4 w-4" />
                Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="handleSignOut"
            >
                <LogOut class="h-4 w-4" />
                Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
