import { defineConfig } from ' + chr(39) + 'vite' + chr(39) + ';
import react from ' + chr(39) + '@vitejs/plugin-react' + chr(39) + ';
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [' + chr(39) + 'react' + chr(39) + ', ' + chr(39) + 'react-dom' + chr(39) + ', ' + chr(39) + 'react-router-dom' + chr(39) + '],
          firebase: [' + chr(39) + 'firebase/app' + chr(39) + ', ' + chr(39) + 'firebase/auth' + chr(39) + '],
          i18n: [' + chr(39) + 'react-i18next' + chr(39) + ', ' + chr(39) + 'i18next' + chr(39) + '],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      ' + chr(39) + '/api' + chr(39) + ': {
        target: ' + chr(39) + 'https://sigo-com-fe-api.onrender.com' + chr(39) + ',
        changeOrigin: true,
        secure: false,
      },
      ' + chr(39) + '/ws' + chr(39) + ': {
        target: ' + chr(39) + 'wss://sigo-com-fe-api.onrender.com' + chr(39) + ',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});