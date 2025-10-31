import { defineConfig } from 'vite'

export default defineConfig({
  base: '/vanilla-message/',
  define: {
    global: 'globalThis',
  },
})
