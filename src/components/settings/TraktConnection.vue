<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loader2, Link2, Unlink, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TraktStatus {
    connected: boolean;
    username?: string;
    userId?: string;
    connectedAt?: string;
    expired?: boolean;
}

const loading = ref(true);
const disconnecting = ref(false);
const status = ref<TraktStatus | null>(null);
const error = ref<string | null>(null);

const fetchStatus = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await fetch('/api/auth/trakt/status');
        if (!response.ok) {
            throw new Error('Failed to fetch Trakt status');
        }
        status.value = await response.json();
    } catch (e) {
        console.error('Error fetching Trakt status:', e);
        error.value = 'Failed to load connection status';
    } finally {
        loading.value = false;
    }
};

const connectTrakt = () => {
    // Redirect to the OAuth flow
    window.location.href = '/api/auth/trakt/connect';
};

const disconnectTrakt = async () => {
    if (!confirm('Are you sure you want to disconnect your Trakt account?')) {
        return;
    }

    disconnecting.value = true;
    error.value = null;
    try {
        const response = await fetch('/api/auth/trakt/disconnect', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to disconnect Trakt');
        }
        status.value = { connected: false };
    } catch (e) {
        console.error('Error disconnecting Trakt:', e);
        error.value = 'Failed to disconnect Trakt account';
    } finally {
        disconnecting.value = false;
    }
};

onMounted(() => {
    fetchStatus();
    
    // Check URL for callback messages
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trakt') === 'connected') {
        // Clean URL without reload
        window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('error')?.startsWith('trakt')) {
        error.value = 'Failed to connect Trakt account. Please try again.';
        window.history.replaceState({}, '', window.location.pathname);
    }
});
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.17l-2.59-2.59L6 13.66l4 4 8-8-1.41-1.42z"/>
                </svg>
                Trakt.tv
            </CardTitle>
            <CardDescription>
                Connect your Trakt.tv account to sync your watch history and ratings.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div v-if="loading" class="flex items-center justify-center py-4">
                <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>

            <div v-else-if="error" class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <p class="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle class="h-4 w-4" />
                    {{ error }}
                </p>
            </div>

            <div v-else-if="status?.connected" class="space-y-4">
                <div class="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle2 class="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-green-600 dark:text-green-400">Connected</p>
                        <p class="text-sm text-muted-foreground truncate">
                            Signed in as <a 
                                :href="`https://trakt.tv/users/${status.username}`"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="font-medium text-foreground hover:underline inline-flex items-center gap-1"
                            >
                                @{{ status.username }}
                                <ExternalLink class="h-3 w-3" />
                            </a>
                        </p>
                    </div>
                </div>

                <div v-if="status.expired" class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p class="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <AlertCircle class="h-4 w-4" />
                        Your connection has expired. Please reconnect to continue syncing.
                    </p>
                </div>

                <div class="flex gap-2">
                    <Button 
                        v-if="status.expired"
                        @click="connectTrakt" 
                        class="flex-1"
                    >
                        <Link2 class="mr-2 h-4 w-4" />
                        Reconnect
                    </Button>
                    <Button 
                        variant="outline" 
                        @click="disconnectTrakt"
                        :disabled="disconnecting"
                        :class="status.expired ? '' : 'w-full'"
                    >
                        <Loader2 v-if="disconnecting" class="mr-2 h-4 w-4 animate-spin" />
                        <Unlink v-else class="mr-2 h-4 w-4" />
                        Disconnect
                    </Button>
                </div>
            </div>

            <div v-else class="space-y-4">
                <p class="text-sm text-muted-foreground">
                    Link your Trakt.tv account to automatically track the movies and shows you watch.
                </p>
                <Button @click="connectTrakt" class="w-full">
                    <Link2 class="mr-2 h-4 w-4" />
                    Connect Trakt Account
                </Button>
            </div>
        </CardContent>
    </Card>
</template>
