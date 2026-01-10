<script setup lang="ts">
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import AvatarUpload from './AvatarUpload.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();
const loading = ref(false);
const name = ref(authStore.user?.name || '');

const updateProfile = async () => {
  loading.value = true;
  try {
    await authClient.updateUser({
      name: name.value
    });
    // Refresh session
    await authStore.fetchSession();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-8">
    <AvatarUpload />

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
        <Input id="email" :model-value="authStore.user?.email" disabled />
      </div>
    </div>

    <Button type="button" class="w-full" :disabled="loading" @click="updateProfile">
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
      Save Changes
    </Button>
  </div>
</template>
