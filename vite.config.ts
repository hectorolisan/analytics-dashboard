import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  // GitHub Pages sirve en /<repo>/; en local queda en /
  base: `${process.env.PAGES_BASE_PATH ?? ''}/`,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Red Eléctrica · Dashboard',
        short_name: 'Red Eléctrica',
        description: 'Demanda y generación eléctrica peninsular',
        lang: 'es',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      // incluye el dataset para funcionar sin conexión
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2,json}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
