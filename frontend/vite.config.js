import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: [
      'ohayoubaku-frontend-q8b6.onrender.com',
      '.onrender.com'
    ]
  },
  server: {
    host: true,
    port: process.env.PORT || 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4173',
        ws: true
      }
    }
  }
})