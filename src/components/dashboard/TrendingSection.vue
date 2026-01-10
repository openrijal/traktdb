<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MediaCard from '@/components/media/MediaCard.vue';
import { Loader2 } from 'lucide-vue-next';

interface Props {
    initialData?: any[];
}

const props = defineProps<Props>();
const trending = ref<any[]>(props.initialData || []);
const loading = ref(!props.initialData);
const error = ref<string | null>(null);

onMounted(async () => {
    if (!props.initialData || props.initialData.length === 0) {
        try {
            const res = await fetch('/api/media/trending');
            if (res.ok) {
                const data = await res.json();
                trending.value = data.results || [];
            } else {
                error.value = 'Failed to load trending content';
            }
        } catch (e) {
            error.value = 'An error occurred';
        } finally {
            loading.value = false;
        }
    }
});
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold tracking-tight">Trending Now</h2>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="error" class="text-red-400 py-4">
            {{ error }}
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MediaCard v-for="item in trending.slice(0, 12)" :key="item.id" :media="item" :type="item.media_type" />
        </div>
    </div>
</template>
