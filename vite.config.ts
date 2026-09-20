/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/**
 * Electron masaüstü giriş sayfası (public/desktop-login.html) Vite tarafından
 * işlenmediği için import.meta.env göremiyor. Firebase ayarını derleme sırasında
 * ayrı bir dosyaya yazıp o sayfanın <script> ile yüklemesini sağlıyoruz.
 */
const emitFirebaseConfig = (env: Record<string, string>) => ({
  name: 'emit-firebase-config',
  generateBundle() {
    const config = {
      apiKey: env.VITE_FIREBASE_API_KEY ?? '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: env.VITE_FIREBASE_APP_ID ?? '',
    };
    (this as unknown as { emitFile: (f: Record<string, string>) => void }).emitFile({
      type: 'asset',
      fileName: 'firebase-config.js',
      source: `window.__FIREBASE_CONFIG__ = ${JSON.stringify(config)};`,
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
  plugins: [react(), emitFirebaseConfig(env)],
  base: './',
  server: {
    port: 5188,
    strictPort: true
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    globals: false
  },
  build: {
    rollupOptions: {
      output: {
        // Nadiren değişen satıcı kodunu ayrı parçalara böl: paralel indirilir ve
        // uygulama kodu güncellendiğinde tarayıcı önbelleğinde kalır.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase';
          // 'lucide-react' adı 'react' içerdiği için önce o kontrol edilmeli.
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('@dnd-kit')) return 'dnd';
          if (id.includes('react-dom') || id.includes('/react/')) return 'react';
        }
      }
    }
  }
  };
})
