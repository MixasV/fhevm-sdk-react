import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/solid-poll/',
  plugins: [
    solidPlugin(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  define: {
    global: 'globalThis',
  },
})
