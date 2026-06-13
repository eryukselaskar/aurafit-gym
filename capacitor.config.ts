import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurafit.app',
  appName: 'AuraFit',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'accounts.google.com',
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.google.com',
      '*.googleusercontent.com'
    ]
  },
  android: {
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
  },
  plugins: {
    GoogleSignIn: {
      clientId: '586826078940-5k5rk5sk8ernvn9chli24j62no3qpfvu.apps.googleusercontent.com'
    }
  }
};

export default config;
