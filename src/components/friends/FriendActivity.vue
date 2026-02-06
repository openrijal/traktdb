<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Film, Tv, Star, UserPlus } from 'lucide-vue-next';

interface ActivityItem {
    id: number;
    user: {
        name: string;
        image?: string;
    };
    type: 'watch' | 'rating' | 'friend';
    desc: string;
    time: string;
    media?: {
        title: string;
        image?: string;
    };
}

const activities = ref<ActivityItem[]>([]);
const isLoading = ref(true);

onMounted(async () => {
    // Mock data for now
    await new Promise(r => setTimeout(r, 1000));
    activities.value = [
        {
            id: 1,
            user: { name: 'Sarah Connor', image: '' },
            type: 'watch',
            desc: 'watched Terminator 2: Judgment Day',
            time: '2 hours ago',
            media: { title: 'Terminator 2', image: '' }
        },
        {
            id: 2,
            user: { name: 'John Wick', image: '' },
            type: 'rating',
            desc: 'rated The Matrix 5 stars',
            time: '5 hours ago',
            media: { title: 'The Matrix', image: '' }
        },
        {
            id: 3,
            user: { name: 'Ellen Ripley', image: '' },
            type: 'friend',
            desc: 'became friends with Dwayne Hicks',
            time: 'Yesterday',
        }
    ];
    isLoading.value = false;
});

const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

</script>

<template>
    <div class="space-y-4">
        <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i"
                class="flex items-center space-x-4 p-4 rounded-xl border border-white/5 bg-card/50">
                <div class="h-10 w-10 rounded-full bg-secondary animate-pulse"></div>
                <div class="space-y-2 flex-1">
                    <div class="h-4 w-[200px] bg-secondary animate-pulse rounded"></div>
                    <div class="h-3 w-[100px] bg-secondary/50 animate-pulse rounded"></div>
                </div>
            </div>
        </div>

        <div v-else-if="activities.length > 0" class="space-y-4">
            <Card v-for="item in activities" :key="item.id" class="bg-card/50 border-white/5">
                <CardContent class="p-4 flex gap-4">
                    <Avatar class="h-10 w-10 border border-white/10">
                        <AvatarImage :src="item.user.image || ''" :alt="item.user.name" />
                        <AvatarFallback>{{ getInitials(item.user.name) }}</AvatarFallback>
                    </Avatar>

                    <div class="flex-1 space-y-1">
                        <p class="text-sm">
                            <span class="font-medium text-foreground">{{ item.user.name }}</span>
                            <span class="text-muted-foreground"> {{ item.desc }}</span>
                        </p>
                        <p class="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity v-if="item.type === 'watch'" class="w-3 h-3 text-primary" />
                            <Star v-else-if="item.type === 'rating'" class="w-3 h-3 text-yellow-400" />
                            <UserPlus v-else class="w-3 h-3 text-green-400" />
                            {{ item.time }}
                        </p>
                    </div>

                    <div v-if="item.media" class="hidden sm:block">
                        <!-- Placeholder for media poster if we had one -->
                        <div class="h-12 w-8 bg-secondary rounded border border-white/5"></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div v-else
            class="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-dashed border-white/5">
            <Activity class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity from friends.</p>
        </div>
    </div>
</template>
