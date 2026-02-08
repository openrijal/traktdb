<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { cn } from '@/lib/utils';

type FontSize = 'small' | 'medium' | 'large';

const STORAGE_KEY = 'font-size';
const SIZE_TO_PX: Record<FontSize, string> = {
    small: '16px',
    medium: '18px',
    large: '20px',
};

const currentSize = ref<FontSize>('small');

const applySize = (size: FontSize) => {
    const html = document.documentElement;
    html.setAttribute('data-font-size', size);
    html.style.fontSize = SIZE_TO_PX[size];
};

const setSize = (size: FontSize) => {
    currentSize.value = size;
    localStorage.setItem(STORAGE_KEY, size);
    applySize(size);
};

onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    const size = saved || 'small';
    currentSize.value = size;
    applySize(size);
});
</script>

<template>
    <div
        class="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/70 p-0.5 shadow-sm"
        role="group"
        aria-label="Font size"
    >
        <button
            type="button"
            :class="cn(
                'h-8 w-8 rounded-full text-xs font-semibold transition-colors',
                currentSize === 'small'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
            )"
            @click="setSize('small')"
            aria-label="Small font size"
            title="Small"
        >
            A-
        </button>
        <button
            type="button"
            :class="cn(
                'h-8 w-8 rounded-full text-sm font-semibold transition-colors',
                currentSize === 'medium'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
            )"
            @click="setSize('medium')"
            aria-label="Medium font size"
            title="Medium"
        >
            A
        </button>
        <button
            type="button"
            :class="cn(
                'h-8 w-8 rounded-full text-base font-semibold transition-colors',
                currentSize === 'large'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
            )"
            @click="setSize('large')"
            aria-label="Large font size"
            title="Large"
        >
            A+
        </button>
    </div>
</template>
