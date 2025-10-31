import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  base: '/solid-poll/',
  plugins: [solidPlugin()],
  define: {
    global: 'globalThis',
  },
})
