import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/pwa/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt'], // favicon.svg optional if present
      manifest: {
        name: 'My PWA App',
        short_name: 'PWA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: mode === 'production' ? '/pwa/' : '/',
        start_url: mode === 'production' ? '/pwa/' : '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
}));
