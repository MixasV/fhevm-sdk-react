import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/svelte-voting/',
  plugins: [
    svelte(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  define: {
    global: 'globalThis',
  },
})
