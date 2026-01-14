
<script setup lang="ts">
import { computed } from 'vue';
import { useFriendStore, type FriendUser } from '@/stores/friends';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserMinus, Clock, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
    user: FriendUser;
    friendshipId?: number; // Optional, present if it's an existing relation item
}>();

const store = useFriendStore();
const status = computed(() => store.getFriendshipStatus(props.user.id));

const isLoading = computed(() => store.isLoading);

// Helpers for initials
const initials = computed(() => {
    return props.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
});

const handleAdd = async () => {
    await store.sendRequest(props.user.id);
};

const handleAccept = async () => {
    if (props.friendshipId) {
        await store.acceptRequest(props.friendshipId);
    } else {
        // Fallback if we only have user ID (shouldn't happen in incoming list usually)
        // We need friendship ID to accept.
        // For search results, we won't see "Accept" button typically, only "Add" or "Pending".
        // If status is 'incoming', we must find the friendship ID from store.
        const req = store.incomingRequests.find(r => r.id === props.user.id);
        if (req) await store.acceptRequest(req.friendshipId);
    }
};

const handleRemove = async () => {
    if (props.friendshipId) {
        await store.removeFriend(props.friendshipId);
    } else {
         // Find ID from any list
         const f = store.friends.find(r => r.id === props.user.id) || 
                   store.outgoingRequests.find(r => r.id === props.user.id) ||
                   store.incomingRequests.find(r => r.id === props.user.id);
        if (f) await store.removeFriend(f.friendshipId);
    }
};

</script>

<template>
    <div class="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
        <div class="flex items-center gap-3">
            <Avatar class="h-10 w-10 border border-white/10">
                <AvatarImage :src="user.image" :alt="user.name" />
                <AvatarFallback class="bg-indigo-900 text-indigo-200">{{ initials }}</AvatarFallback>
            </Avatar>
            <div class="flex flex-col">
                <span class="font-medium text-gray-200">{{ user.name }}</span>
                <span v-if="status === 'friend'" class="text-xs text-green-400 flex items-center gap-1">
                    <UserCheck class="w-3 h-3" /> Friend
                </span>
                <span v-else-if="status === 'outgoing'" class="text-xs text-amber-400 flex items-center gap-1">
                    <Clock class="w-3 h-3" /> Request Sent
                </span>
                <span v-else-if="status === 'incoming'" class="text-xs text-indigo-400 flex items-center gap-1">
                    <UserPlus class="w-3 h-3" /> Request Received
                </span>
            </div>
        </div>

        <div class="flex gap-2">
            <template v-if="status === 'none'">
                <Button size="sm" variant="default" @click="handleAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <UserPlus class="w-4 h-4" />
                    Add
                </Button>
            </template>

            <template v-else-if="status === 'incoming'">
                <Button size="sm" variant="default" @click="handleAccept" class="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <UserCheck class="w-4 h-4" />
                    Accept
                </Button>
                <Button size="sm" variant="ghost" @click="handleRemove" class="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    Reject
                </Button>
            </template>

            <template v-else-if="status === 'outgoing'">
                <Button size="sm" variant="ghost" @click="handleRemove" class="text-gray-400 hover:text-white hover:bg-white/10">
                    Cancel
                </Button>
            </template>

            <template v-else-if="status === 'friend'">
                <Button size="sm" variant="ghost" @click="handleRemove" class="text-red-400 hover:text-red-300 hover:bg-red-900/20" title="Remove Friend">
                    <UserMinus class="w-4 h-4" />
                </Button>
            </template>
        </div>
    </div>
</template>
