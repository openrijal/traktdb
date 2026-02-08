<script setup lang="ts">
import { computed } from 'vue';
import { Headphones, Podcast, ExternalLink, ArrowLeft } from 'lucide-vue-next';
import ListenStatusButton from './ListenStatusButton.vue';
import { getPodcastArtwork } from '@/lib/images';

const props = defineProps<{
    podcast: {
        id: string;
        listenNotesId?: string;
        itunesId?: number;
        title: string;
        publisher: string;
        description?: string | null;
        image?: string | null;
        thumbnail?: string | null;
        totalEpisodes?: number | null;
        listenScore?: number | null;
        website?: string | null;
        genres?: (string | number)[] | null;
        listennotesUrl?: string | null;
    };
}>();

const imageUrl = computed(() =>
    getPodcastArtwork({
        artworkUrl600: props.podcast.image || undefined,
        artworkUrl100: props.podcast.thumbnail || undefined,
    })
);

const podcastExternalId = computed(() =>
    props.podcast.listenNotesId || props.podcast.id
);

const podcastDataForStatus = computed(() => ({
    title: props.podcast.title,
    publisher: props.podcast.publisher,
    image: props.podcast.image,
    description: props.podcast.description,
    listenNotesId: props.podcast.listenNotesId,
    itunesId: props.podcast.itunesId,
}));
</script>

<template>
    <div class="relative w-full min-h-[400px] flex items-end">
        <!-- Background with gradient -->
        <div class="absolute inset-0 z-0">
            <div v-if="imageUrl" class="absolute inset-0">
                <img :src="imageUrl" :alt="podcast.title" class="w-full h-full object-cover blur-2xl opacity-30" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"></div>
        </div>

        <!-- Back Button -->
        <div class="absolute top-4 left-4 z-20 md:top-8 md:left-8">
            <a href="/library/podcasts"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-background/40 transition-colors text-sm font-medium text-foreground">
                <ArrowLeft class="w-4 h-4" />
                <span>Back</span>
            </a>
        </div>

        <!-- Content Container -->
        <div
            class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 items-start">

            <!-- Artwork -->
            <div class="w-48 md:w-64 rounded-2xl overflow-hidden shadow-md border-4 border-white/10 shrink-0">
                <img v-if="imageUrl" :src="imageUrl" :alt="podcast.title"
                    class="w-full h-auto aspect-square object-cover" />
                <div v-else class="w-full aspect-square bg-secondary flex items-center justify-center">
                    <Podcast class="w-16 h-16 text-muted-foreground" />
                </div>
            </div>

            <!-- Text Content -->
            <div class="flex-1 space-y-4 text-foreground">
                <div class="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                    <span class="border border-primary/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Headphones class="w-3 h-3" />
                        Podcast
                    </span>
                    <span v-if="podcast.totalEpisodes">&bull;</span>
                    <span v-if="podcast.totalEpisodes">{{ podcast.totalEpisodes }} episodes</span>
                </div>

                <h1
                    class="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                    {{ podcast.title }}
                </h1>

                <p class="text-lg text-muted-foreground">
                    by {{ podcast.publisher }}
                </p>

                <div v-if="podcast.listenScore" class="flex items-center gap-2 text-sm text-secondary-foreground">
                    <div class="flex items-center gap-1.5 bg-primary/20 px-2 py-1 rounded">
                        <span class="text-primary font-semibold">Listen Score:</span>
                        <span class="text-foreground font-bold">{{ podcast.listenScore }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-4 py-4">
                    <ListenStatusButton :external-id="podcastExternalId" :podcast-data="podcastDataForStatus" />

                    <a v-if="podcast.website" :href="podcast.website" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                        <ExternalLink class="w-4 h-4" />
                        Website
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
