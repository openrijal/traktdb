<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useFriendStore } from '@/stores/friends';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, UserPlus, Mail, Activity, Share2 } from 'lucide-vue-next';
import FriendCard from './FriendCard.vue';
import UserSearch from './UserSearch.vue';
import FriendActivity from './FriendActivity.vue';
import InviteFriend from './InviteFriend.vue';

const store = useFriendStore();
const activeTab = ref('list');

onMounted(() => {
    store.fetchFriends();
});

const friendsCount = computed(() => store.friends.length);
const incomingCount = computed(() => store.incomingRequests.length);
const outgoingCount = computed(() => store.outgoingRequests.length);

</script>

<template>
    <div class="space-y-6">
        <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-5 bg-card/50 p-1 rounded-xl">
                <TabsTrigger value="list" class="flex items-center gap-2">
                    <Users class="w-4 h-4" />
                    <span class="hidden sm:inline">Friends</span>
                    <span v-if="friendsCount > 0"
                        class="ml-1 bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{{
                        friendsCount }}</span>
                </TabsTrigger>
                <TabsTrigger value="activity" class="flex items-center gap-2">
                    <Activity class="w-4 h-4" />
                    <span class="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="requests" class="flex items-center gap-2 relative">
                    <Mail class="w-4 h-4" />
                    <span class="hidden sm:inline">Requests</span>
                    <span v-if="incomingCount > 0"
                        class="ml-1 bg-primary text-foreground text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{{
                        incomingCount }}</span>
                </TabsTrigger>
                <TabsTrigger value="search" class="flex items-center gap-2">
                    <UserPlus class="w-4 h-4" />
                    <span class="hidden sm:inline">Find</span>
                </TabsTrigger>
                <TabsTrigger value="invite" class="flex items-center gap-2">
                    <Share2 class="w-4 h-4" />
                    <span class="hidden sm:inline">Invite</span>
                </TabsTrigger>
            </TabsList>

            <!-- Friends List -->
            <TabsContent value="list" class="mt-6 space-y-4 outline-none">
                <div v-if="store.isLoading" class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>

                <div v-else-if="store.friends.length > 0" class="grid gap-3 md:grid-cols-2">
                    <FriendCard v-for="friend in store.friends" :key="friend.friendshipId" :user="friend"
                        :friendshipId="friend.friendshipId" />
                </div>

                <div v-else
                    class="text-center py-20 text-muted-foreground bg-card/20 rounded-xl border border-dashed border-white/5">
                    <Users class="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p class="text-lg">You haven't added any friends yet.</p>
                    <button @click="activeTab = 'search'" class="text-primary hover:underline mt-2">Find
                        friends</button>
                </div>
            </TabsContent>

            <!-- Activity -->
            <TabsContent value="activity" class="mt-6 outline-none">
                <FriendActivity />
            </TabsContent>

            <!-- Requests -->
            <TabsContent value="requests" class="mt-6 space-y-8 outline-none">

                <!-- Incoming -->
                <div class="space-y-4">
                    <h3 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Incoming Requests
                        <span class="text-xs bg-secondary px-2 py-0.5 rounded-full">{{ incomingCount }}</span>
                    </h3>

                    <div v-if="incomingCount > 0" class="grid gap-3 md:grid-cols-2">
                        <FriendCard v-for="req in store.incomingRequests" :key="req.friendshipId" :user="req"
                            :friendshipId="req.friendshipId" />
                    </div>
                    <div v-else class="text-sm text-muted-foreground italic px-4">No pending incoming requests.</div>
                </div>

                <!-- Outgoing -->
                <div class="space-y-4">
                    <h3 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Outgoing Requests
                        <span class="text-xs bg-secondary px-2 py-0.5 rounded-full">{{ outgoingCount }}</span>
                    </h3>

                    <div v-if="outgoingCount > 0" class="grid gap-3 md:grid-cols-2">
                        <FriendCard v-for="req in store.outgoingRequests" :key="req.friendshipId" :user="req"
                            :friendshipId="req.friendshipId" />
                    </div>
                    <div v-else class="text-sm text-muted-foreground italic px-4">No pending outgoing requests.</div>
                </div>
            </TabsContent>

            <!-- Search -->
            <TabsContent value="search" class="mt-6 outline-none">
                <UserSearch />
            </TabsContent>

            <!-- Invite -->
            <TabsContent value="invite" class="mt-6 outline-none">
                <InviteFriend />
            </TabsContent>
        </Tabs>
    </div>
</template>
