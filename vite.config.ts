import "dotenv/config";
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false
        },
        manifest: {
          short_name: "eGPTenderHub",
          name: "eGPTenderHub Analyst",
          icons: [
            {
              src: "https://picsum.photos/seed/tender/192/192",
              type: "image/png",
              sizes: "192x192"
            },
            {
              src: "https://picsum.photos/seed/tender/512/512",
              type: "image/png",
              sizes: "512x512"
            }
          ],
          start_url: ".",
          display: "standalone",
          theme_color: "#2563eb",
          background_color: "#ffffff"
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey || ""),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };
});
