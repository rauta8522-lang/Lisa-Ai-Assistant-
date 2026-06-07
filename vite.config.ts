import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'; // 👈 PWA प्लगइन इम्पोर्ट किया

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({ // 👈 PWA कॉन्फ़िगरेशन यहाँ मर्ज कर दिया है
        registerType: 'autoUpdate', 
        includeAssets: [
          'favicon.ico', 
          'apple-touch-icon.png', 
          'masked-icon.svg', 
          'robots.txt'
        ],
        workbox: {
          cleanupOutdatedCaches: true, 
          skipWaiting: true,           
          clientsClaim: true,
        },
        manifest: {
          name: 'Lisa AI Voice Assistant',
          short_name: 'Lisa',
          description: 'Lisa - An Indian Female AI Assistant with deep emotional EQ',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: 'screenshot1.jpg',
              sizes: '1080x2400',
              type: 'image/jpeg',
              form_factor: 'narrow'
            }
          ]
        }
      })
    ],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      host: true, 
      port: 3000, 
      allowedHosts: [
        'lisa-ai-assistant.onrender.com',
      ],
    },
  };
});