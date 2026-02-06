<script setup lang="ts">
import { onMounted, computed, ref, type PropType } from 'vue';
import { usePodcastStore } from '@/stores/podcasts';
import { ListenStatus, ListenStatusLabels } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ChevronDown, Headphones, ListPlus, Check, X } from 'lucide-vue-next';

const props = defineProps({
    externalId: {
        type: String,
        required: true
    },
    podcastData: {
        type: Object as PropType<{
            title: string;
            publisher: string;
            image?: string | null;
            description?: string | null;
            listenNotesId?: string;
            itunesId?: number | string;
        }>,
        default: null
    }
});

const store = usePodcastStore();
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

onMounted(() => {
    store.fetchStatus(props.externalId);
    document.addEventListener('click', handleClickOutside);
});

const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
};

const currentStatus = computed(() => store.getStatus(props.externalId));

const statusOptions = [
    { value: ListenStatus.PLAN_TO_LISTEN, label: ListenStatusLabels[ListenStatus.PLAN_TO_LISTEN], icon: ListPlus },
    { value: ListenStatus.LISTENING, label: ListenStatusLabels[ListenStatus.LISTENING], icon: Headphones },
    { value: ListenStatus.COMPLETED, label: ListenStatusLabels[ListenStatus.COMPLETED], icon: Check },
];

const currentStatusLabel = computed(() => {
    if (!currentStatus.value) return 'Add to Library';
    return ListenStatusLabels[currentStatus.value];
});

const currentIcon = computed(() => {
    const opt = statusOptions.find(o => o.value === currentStatus.value);
    return opt?.icon || ListPlus;
});

const handleStatusChange = (status: ListenStatus | null) => {
    store.updateStatus(props.externalId, status, props.podcastData);
    isOpen.value = false;
};

const toggleMenu = () => {
    isOpen.value = !isOpen.value;
};
</script>

<template>
    <div ref="menuRef" class="relative">
        <Button @click="toggleMenu" :variant="currentStatus ? 'secondary' : 'default'" class="gap-2">
            <component :is="currentIcon" class="w-4 h-4" />
            {{ currentStatusLabel }}
            <ChevronDown class="w-4 h-4 ml-1 opacity-50" :class="{ 'rotate-180': isOpen }" />
        </Button>

        <div v-if="isOpen"
            class="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-md z-50 overflow-hidden">
            <button v-for="option in statusOptions" :key="option.value" @click="handleStatusChange(option.value)"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors"
                :class="{ 'bg-secondary text-primary': currentStatus === option.value }">
                <component :is="option.icon" class="w-4 h-4" />
                {{ option.label }}
            </button>
            <button v-if="currentStatus" @click="handleStatusChange(null)"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-red-400 hover:bg-secondary transition-colors border-t border-border">
                <X class="w-4 h-4" />
                Remove from Library
            </button>
        </div>
    </div>
</template>
