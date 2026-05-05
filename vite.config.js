/**
 * vite.config.js  Vite Configuration
 *
 * Vite is the build tool that powers SvelteKit. It handles:
 * - Running the development server (`npm run dev`)
 * - Bundling your code for production (`npm run build`)
 * - Hot module replacement (instant updates when you save files)
 *
 * For most SvelteKit projects, you don't need to change this file.
 * The sveltekit() plugin handles everything automatically.
 *
 * Learn more: https://vite.dev/config/
 */
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [mode === 'test' ? svelte({ hot: false }) : sveltekit(), ViteYaml()],
  ...(mode === 'test' ? { resolve: { conditions: ['browser'] } } : {}),
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large components into separate chunks
          'components-media': [
            'src/lib/components/Media/Image.svelte',
            'src/lib/components/Media/Diptych.svelte',
          ],
          'components-maps': [
            'src/lib/components/Maps/Map.svelte',
            'src/lib/components/Maps/MapLayer.svelte',
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    setupFiles: ['src/tests/setup.js'],
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      '$app/paths': fileURLToPath(
        new URL('./src/lib/__mocks__/$app/paths.js', import.meta.url)
      ),
    },
  },
}));
