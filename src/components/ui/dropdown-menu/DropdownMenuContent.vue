<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuPortal, type DropdownMenuContentProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
    defineProps<DropdownMenuContentProps & { class?: string }>(),
    { sideOffset: 8, align: 'end' },
)
</script>

<template>
    <DropdownMenuPortal>
        <DropdownMenuContent v-bind="{ ...props, class: undefined }" :class="cn(
            'dropdown-menu-content z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
            props.class,
        )">
            <slot />
        </DropdownMenuContent>
    </DropdownMenuPortal>
</template>

<style>
.dropdown-menu-content[data-state='open'] {
    animation: dropdown-in 0.15s ease-out;
}

.dropdown-menu-content[data-state='closed'] {
    animation: dropdown-out 0.1s ease-in;
}

@keyframes dropdown-in {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-4px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes dropdown-out {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    to {
        opacity: 0;
        transform: scale(0.95) translateY(-4px);
    }
}
</style>
