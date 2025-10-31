import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/svelte-voting/',
  plugins: [
    svelte(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  resolve: {
    alias: {
      '@mixaspro/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
      '@mixaspro/svelte': path.resolve(__dirname, '../../packages/svelte/dist/index.js'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
