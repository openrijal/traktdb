<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

type Theme = 'light' | 'dark' | 'system';

const currentTheme = ref<Theme>('system');
const resolvedTheme = ref<'light' | 'dark'>('dark');

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

const applyTheme = (theme: Theme) => {
  const html = document.documentElement;

  if (theme === 'system') {
    resolvedTheme.value = getSystemTheme();
  } else {
    resolvedTheme.value = theme;
  }

  html.classList.remove('light', 'dark');
  html.classList.add(resolvedTheme.value);
  html.setAttribute('data-theme', resolvedTheme.value);
};

const toggleTheme = () => {
  const newTheme = resolvedTheme.value === 'dark' ? 'light' : 'dark';
  currentTheme.value = newTheme;

  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
};

onMounted(() => {
  const saved = localStorage.getItem('theme') as Theme | null;
  currentTheme.value = saved || 'system';
  applyTheme(currentTheme.value);

  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentTheme.value === 'system') {
        applyTheme('system');
      }
    });
  }
});

watch(currentTheme, (newTheme) => {
  applyTheme(newTheme);
});
</script>

<template>
  <Button variant="ghost" size="icon" @click="toggleTheme" :title="`Current: ${currentTheme}. Click to toggle.`"
    class="h-9 w-9">
    <Sun v-if="resolvedTheme === 'light'" class="h-4 w-4" />
    <Moon v-else class="h-4 w-4" />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
