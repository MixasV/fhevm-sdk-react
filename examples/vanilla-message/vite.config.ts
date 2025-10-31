import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/vanilla-message/',
  plugins: [
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  define: {
    global: 'globalThis',
  },
})
