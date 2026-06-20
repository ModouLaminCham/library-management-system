import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // This proxy only takes effect if VITE_API_BASE_URL is set to the
    // relative path "/api" (e.g. in frontend/.env). By default
    // VITE_API_BASE_URL is an absolute URL (http://localhost:8080/api),
    // which bypasses this proxy entirely and talks to the backend directly.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})