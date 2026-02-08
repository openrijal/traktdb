<script setup lang="ts">
import { Camera, CameraResultType } from '@capacitor/camera';
import { useAuthStore } from '@/stores/auth';
import { Loader2, Camera as CameraIcon } from 'lucide-vue-next';
import { ref } from 'vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string }>();

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
  <div :class="cn('flex flex-col items-center gap-4', props.class)">
    <Avatar class="h-24 w-24">
      <AvatarImage v-if="authStore.user?.image" :src="authStore.user.image" :alt="authStore.user.name || 'Avatar'" />
      <AvatarFallback class="text-2xl font-bold bg-secondary text-secondary-foreground">
        {{ authStore.user?.name?.charAt(0).toUpperCase() || '?' }}
      </AvatarFallback>
    </Avatar>

    <Button variant="outline" size="sm" @click="takePhoto" :disabled="uploading">
      <Loader2 v-if="uploading" class="mr-2 h-4 w-4 animate-spin" />
      <CameraIcon v-else class="mr-2 h-4 w-4" />
      Change Avatar
    </Button>
  </div>
</template>
