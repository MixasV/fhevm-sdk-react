import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  base: '/react-counter/',
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@mixaspro/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
      '@mixaspro/react': path.resolve(__dirname, '../../packages/react/dist/index.js'),
    },
  },
  server: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
  },
})
