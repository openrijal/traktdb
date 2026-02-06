<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Copy, Check, Share2 } from 'lucide-vue-next';
import { useClipboard } from '@vueuse/core';

// In a real app, this would be generated from the backend based on the user's ID
const inviteLink = ref(`${window.location.origin}/register?ref=user_invite`);
const { copy, copied } = useClipboard({ source: inviteLink });

</script>

<template>
    <div class="grid gap-6 md:grid-cols-2">
        <Card class="bg-card/50 border-white/5">
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Share2 class="w-5 h-5 text-primary" />
                    Invite via Link
                </CardTitle>
                <CardDescription>
                    Share this link with your friends to let them join Traktdb and connect with you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex gap-2">
                    <Input v-model="inviteLink" readonly class="bg-background border-white/10" />
                    <Button @click="copy(inviteLink)" variant="outline" class="gap-2 min-w-[100px]">
                        <Check v-if="copied" class="w-4 h-4 text-green-500" />
                        <Copy v-else class="w-4 h-4" />
                        <span v-if="copied">Copied</span>
                        <span v-else>Copy</span>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-primary/20 to-card/50 border-primary/20">
            <CardContent class="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
                <div class="p-3 bg-primary/20 rounded-full">
                    <Share2 class="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h3 class="font-medium text-lg">Grow your circle</h3>
                    <p class="text-sm text-muted-foreground mt-1">
                        Track movies and TV shows together. See what your friends are watching and get recommendations.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
