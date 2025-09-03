// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // 👈 alias @ -> src
    },
  },

  // Dev-server (convenient for CORS via proxy)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3100', // API-Gateway
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 5173,
  },

  // Vitest config (previously it caused typing to fail)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    reporters: 'default',
    coverage: { reporter: ['text', 'lcov'] },
  },
});
