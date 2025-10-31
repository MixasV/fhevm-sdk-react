import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  external: ['solid-js', '@mixaspro/core'],
  outDir: 'dist',
  target: 'es2020',
  platform: 'browser',
})
