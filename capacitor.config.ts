import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.watania.basit',
  appName: 'BASIT | باسط',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#3B0764',
    allowMixedContent: false,
  },
};

export default config;
