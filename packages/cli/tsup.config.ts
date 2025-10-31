import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  external: ['@mixaspro/core', 'commander', 'prompts', 'chalk', 'ora', 'fs-extra'],
  outDir: 'dist',
  target: 'node18',
  platform: 'node',
})
