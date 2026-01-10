<script setup lang="ts">
import { AvatarRoot } from 'radix-vue'
import type { AvatarRootVariants } from './variants'
import { cn } from '@/lib/utils'

interface Props {
    size?: AvatarRootVariants['size']
    shape?: AvatarRootVariants['shape']
    class?: string
}

const props = withDefaults(defineProps<Props>(), {
    size: 'sm',
    shape: 'circle',
})
</script>

<template>
    <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)">
        <slot />
    </AvatarRoot>
</template>
