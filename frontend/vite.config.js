import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sigo-com-fe-api.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://sigo-com-fe-api.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
