<script setup lang="ts">
import { DropdownMenuRoot, type DropdownMenuRootProps } from 'radix-vue'

const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
    <DropdownMenuRoot v-bind="props" @update:open="emits('update:open', $event)">
        <slot />
    </DropdownMenuRoot>
</template>
