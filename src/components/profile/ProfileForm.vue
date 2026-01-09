<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import AvatarUpload from './AvatarUpload.vue';

const authStore = useAuthStore();
const loading = ref(false);
const name = ref(authStore.user?.name || '');

const updateProfile = async () => {
    loading.value = true;
    try {
        await authStore.authClient.updateUser({
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
        <label for="name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Display Name
        </label>
        <input
          id="name"
          v-model="name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Your name"
        />
      </div>
      <div class="grid gap-2">
        <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email
        </label>
        <input
          id="email"
          :value="authStore.user?.email"
          disabled
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
      :disabled="loading"
      @click="updateProfile"
    >
      <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
      Save Changes
    </button>
  </div>
</template>
