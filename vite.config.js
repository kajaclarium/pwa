import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  base: isProd ? "/pwa/" : "/",    // 👈 FIX: local uses "/", build uses "/pwa/"
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'My PWA App',
        short_name: 'PWA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',

        // Correct scope for GitHub Pages
        scope: "/pwa/",
        start_url: "/pwa/",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
})
