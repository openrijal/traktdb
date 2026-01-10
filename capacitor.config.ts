import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.tracktdb.app',
    appName: 'tracktdb',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        url: 'https://traktdb.rijal-it.workers.dev',
        cleartext: true
    }
};

export default config;
