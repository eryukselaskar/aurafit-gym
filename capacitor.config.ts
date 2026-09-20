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
      // Kendi Firebase projenizin OAuth istemci kimliği. .env dosyasındaki
      // VITE_GOOGLE_CLIENT_ID ile aynı olmalı.
      clientId: process.env.VITE_GOOGLE_CLIENT_ID ?? ''
    }
  }
};

export default config;
