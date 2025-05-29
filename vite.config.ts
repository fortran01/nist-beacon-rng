import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/nist-beacon-rng/' : '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 