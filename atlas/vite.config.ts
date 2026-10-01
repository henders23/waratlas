import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ATLAS_BASE lets the same build be served at a domain root or under a path such as
// example.com/war-atlas/.
export default defineConfig({
  base: process.env.ATLAS_BASE ?? '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('maplibre-gl') ? 'maplibre' : id.includes('node_modules') ? 'vendor' : undefined),
      },
    },
  },
  server: { host: true, port: 5173 },
});
