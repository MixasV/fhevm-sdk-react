import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  base: '/vanilla-message/',
  plugins: [
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  resolve: {
    alias: {
      '@mixaspro/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
