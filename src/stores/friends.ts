
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface FriendUser {
    id: string;
    name: string;
    image?: string;
}

export interface FriendItem {
    friendshipId: number;
    id: string;
    name: string;
    image?: string;
    createdAt: string;
}

export const useFriendStore = defineStore('friends', () => {
    const friends = ref<FriendItem[]>([]);
    const incomingRequests = ref<FriendItem[]>([]);
    const outgoingRequests = ref<FriendItem[]>([]);
    const searchResults = ref<FriendUser[]>([]);
    const isLoading = ref(false);
    const isSearching = ref(false);

    async function fetchFriends() {
        isLoading.value = true;
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                const data = await res.json();
                friends.value = data.friends || [];
                incomingRequests.value = data.incoming || [];
                outgoingRequests.value = data.outgoing || [];
            }
        } catch (e) {
            console.error('Failed to fetch friends', e);
        } finally {
            isLoading.value = false;
        }
    }

    async function searchUsers(query: string) {
        if (!query || query.length < 3) return;
        isSearching.value = true;
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                searchResults.value = data.users || [];
            }
        } catch (e) {
            console.error('Failed to search users', e);
        } finally {
            isSearching.value = false;
        }
    }

    async function sendRequest(targetUserId: string) {
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId })
            });
            if (res.ok) {
                await fetchFriends(); // Refresh lists
                // Optimistically update search results UI if needed, usually refresh is enough
            } else {
                const err = await res.json();
                throw new Error(err.error || 'Failed to send request');
            }
        } catch (e) {
            console.error('Error sending friend request:', e);
            throw e;
        }
    }

    async function acceptRequest(friendshipId: number) {
        try {
            const res = await fetch('/api/friends/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendshipId })
            });
            if (res.ok) {
                await fetchFriends();
            }
        } catch (e) {
            console.error('Error accepting friend request:', e);
        }
    }

    async function removeFriend(friendshipId: number) {
        try {
            const res = await fetch('/api/friends/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendshipId })
            });
            if (res.ok) {
                await fetchFriends();
            }
        } catch (e) {
            console.error('Error removing friend:', e);
        }
    }

    // Computed or helper to check status given a userId
    function getFriendshipStatus(userId: string) {
        if (friends.value.some(f => f.id === userId)) return 'friend';
        if (incomingRequests.value.some(f => f.id === userId)) return 'incoming';
        if (outgoingRequests.value.some(f => f.id === userId)) return 'outgoing';
        return 'none';
    }

    return {
        friends,
        incomingRequests,
        outgoingRequests,
        searchResults,
        isLoading,
        isSearching,
        fetchFriends,
        searchUsers,
        sendRequest,
        acceptRequest,
        removeFriend,
        getFriendshipStatus
    };
});
