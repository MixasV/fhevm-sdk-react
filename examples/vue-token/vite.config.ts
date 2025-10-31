import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/vue-token/',
  plugins: [
    vue(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  define: {
    global: 'globalThis',
  },
})
