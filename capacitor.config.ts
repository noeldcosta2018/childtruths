import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.childtruths.app',
  appName: 'ChildTruths',
  webDir: 'out',
  server: {
    // Use live Vercel URL for live updates (no app store resubmission needed)
    url: 'https://childtruths.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0E17',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0E17',
    },
  },
  ios: {
    scheme: 'ChildTruths',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
