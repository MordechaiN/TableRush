import { defineConfig } from 'vite';

// VITE_BASE_PATH is set by CI to '/TableRush/' for GitHub Pages.
// Locally defaults to './' so dev and preview work without configuration.
const base = process.env.VITE_BASE_PATH ?? './';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
