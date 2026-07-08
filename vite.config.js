import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://cinema-api.us-east-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
