import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Lisa - AI Voice Assistant',
          short_name: 'Lisa',
          description: 'AI Voice Assistant powered by Google Gemini',
          theme_color: '#1a1a2e',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
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
              src: 'screenshot1.png',
              sizes: '540x720',
              type: 'image/png',
              form_factor: 'narrow'
            },
            {
              src: 'screenshot2.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide'
            }
          ],
          categories: ['productivity', 'utilities'],
          shortcuts: [
            {
              name: 'Start Voice Chat',
              short_name: 'Voice Chat',
              description: 'Start a voice conversation with Lisa',
              url: '/?mode=voice',
              icons: [
                { src: 'pwa-192x192.png', sizes: '192x192' }
              ]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,gif,webp}'],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5000000,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'gemini-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 3600
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },    build: {
      chunkSizeWarningLimit: 750,
      rollupOptions: {
        output: {
          manualChunks: {
            'google-ai': ['@google/generative-ai', '@google/genai'],
            'framer': ['framer-motion', 'motion'],
          },
        },
      },
    },    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
