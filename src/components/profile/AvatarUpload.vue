<script setup lang="ts">
import { Camera, CameraResultType } from '@capacitor/camera';
import { useAuthStore } from '@/stores/auth';
import { Loader2, Camera as CameraIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const authStore = useAuthStore();
const uploading = ref(false);

const takePhoto = async () => {
  uploading.value = true;
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });

    if (image.base64String) {
      // TODO: Implement actual upload to storage and update user profile
      // For now just console log
      console.log('Got image', image.base64String.substring(0, 50));
    }
  } catch (error) {
    console.error('Camera error', error);
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative h-24 w-24 overflow-hidden rounded-full bg-muted">
      <img
        v-if="authStore.user?.image"
        :src="authStore.user.image"
        alt="Avatar"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
        <span class="text-2xl font-bold">{{ authStore.user?.name?.charAt(0) || '?' }}</span>
      </div>
    </div>
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
      @click="takePhoto"
      :disabled="uploading"
    >
      <Loader2 v-if="uploading" class="mr-2 h-4 w-4 animate-spin" />
      <CameraIcon v-else class="mr-2 h-4 w-4" />
      Change Avatar
    </button>
  </div>
</template>
