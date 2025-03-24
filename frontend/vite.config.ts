/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',
    allowedHosts: [
      'https://localhost',
      'localhost',
      'https://localhost:6791',
      'localhost:6791',
      'https://local.rfsight.com',
      'local.rfsight.com',
    ],
    strictPort: true,
    port: 6791,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
