import type { App } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export default (app: App) => {
    const pinia = createPinia();
    if (typeof window !== 'undefined') {
        pinia.use(piniaPluginPersistedstate);
        defineCustomElements(window);
    }
    app.use(pinia);
};
