import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  base: '/vue-token/',
  plugins: [
    vue(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  resolve: {
    alias: {
      '@mixaspro/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
      '@mixaspro/vue': path.resolve(__dirname, '../../packages/vue/dist/index.js'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
