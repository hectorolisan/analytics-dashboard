/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages sirve en /<repo>/; en local queda en /
  base: `${process.env.PAGES_BASE_PATH ?? ''}/`,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
})
