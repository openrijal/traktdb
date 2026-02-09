<script setup lang="ts">
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import AvatarUpload from './AvatarUpload.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps<{
  initialUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}>();

const authStore = useAuthStore();
const loading = ref(false);
if (!authStore.user && props.initialUser) {
  authStore.user = props.initialUser as any;
}
const name = ref(props.initialUser?.name || authStore.user?.name || '');

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'TV Movie', 'War', 'Western',
];

const selectedGenres = ref<string[]>([]);
const loadingGenres = ref(false);
const savingGenres = ref(false);
const genreError = ref<string | null>(null);

const updateProfile = async () => {
  loading.value = true;
  try {
    await authClient.updateUser({
      name: name.value
    });
    await authStore.fetchSession();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchGenres = async () => {
  loadingGenres.value = true;
  genreError.value = null;
  try {
    const res = await fetch('/api/profile/genres');
    if (res.ok) {
      const data = await res.json();
      selectedGenres.value = data.genres || [];
    }
  } catch (e) {
    genreError.value = 'Failed to load interests.';
    console.error(e);
  } finally {
    loadingGenres.value = false;
  }
};

const toggleGenre = (genre: string) => {
  const set = new Set(selectedGenres.value);
  if (set.has(genre)) {
    set.delete(genre);
  } else if (set.size < 12) {
    set.add(genre);
  }
  selectedGenres.value = Array.from(set);
};

const saveGenres = async () => {
  savingGenres.value = true;
  genreError.value = null;
  try {
    const res = await fetch('/api/profile/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genres: selectedGenres.value }),
    });
    if (!res.ok) {
      throw new Error('Failed to save');
    }
  } catch (e) {
    genreError.value = 'Failed to save interests.';
    console.error(e);
  } finally {
    savingGenres.value = false;
  }
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchSession();
  }
  if (!name.value && authStore.user?.name) {
    name.value = authStore.user.name;
  }
  await fetchGenres();
});

watch(
  () => authStore.user,
  (user) => {
    if (user?.name && !name.value) {
      name.value = user.name;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-10">
    <div class="grid gap-8 md:grid-cols-[200px_1fr] items-start">
      <AvatarUpload class="items-start" />

      <div class="space-y-5">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <label for="name"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Display Name
            </label>
            <Input id="name" v-model="name" placeholder="Your name" />
          </div>
          <div class="grid gap-2">
            <label for="email"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input id="email" :model-value="authStore.user?.email || props.initialUser?.email" disabled />
          </div>
        </div>

        <Button type="button" class="w-full sm:w-auto" :disabled="loading" @click="updateProfile">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Save Changes
        </Button>
      </div>
    </div>

    <div class="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      <div class="flex flex-col gap-1">
        <h4 class="text-base font-semibold">Interests</h4>
        <p class="text-sm text-muted-foreground">
          Pick up to 12 genres you want to see more of.
        </p>
      </div>

      <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <button v-for="genre in GENRES" :key="genre" type="button" :class="cn(
          'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          selectedGenres.includes(genre)
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
        )" @click="toggleGenre(genre)">
          {{ genre }}
        </button>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" :disabled="savingGenres" @click="saveGenres">
          <Loader2 v-if="savingGenres" class="mr-2 h-4 w-4 animate-spin" />
          Save Interests
        </Button>
        <span v-if="loadingGenres" class="text-xs text-muted-foreground">Loading...</span>
        <span v-else-if="genreError" class="text-xs text-destructive">{{ genreError }}</span>
        <span v-else class="text-xs text-muted-foreground">
          {{ selectedGenres.length }}/12 selected
        </span>
      </div>
    </div>
  </div>
</template>
