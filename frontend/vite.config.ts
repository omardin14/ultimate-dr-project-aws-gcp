import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/cards': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/balance': {
        target: process.env.VITE_BALANCE_API_URL || 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/barcode': {
        target: process.env.VITE_BARCODE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})

