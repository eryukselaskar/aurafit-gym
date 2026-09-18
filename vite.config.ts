/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
