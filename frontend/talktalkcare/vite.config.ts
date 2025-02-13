import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
    'import.meta.env.VITE_API_WS_URL': JSON.stringify(process.env.VITE_API_WS_URL),
    'import.meta.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(process.env.VITE_AWS_ACCESS_KEY_ID),
    'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(process.env.VITE_AWS_SECRET_ACCESS_KEY),
    'import.meta.env.VITE_AWS_REGION': JSON.stringify(process.env.VITE_AWS_REGION)
  },
  server: {
    proxy: {
      '/tts-api': {
        target: 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts-api/, '/tts-premium/v1/tts')
      }
    }
  }
});
