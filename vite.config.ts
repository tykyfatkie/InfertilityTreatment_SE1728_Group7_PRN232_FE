import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7184',
        changeOrigin: true,
        secure: false, // Cho phép HTTPS self-signed certificates
      },
    },
  },
})