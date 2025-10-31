import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  base: '/solid-poll/',
  plugins: [
    solidPlugin(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  resolve: {
    alias: {
      '@mixaspro/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
      '@mixaspro/solid': path.resolve(__dirname, '../../packages/solid/dist/index.js'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
