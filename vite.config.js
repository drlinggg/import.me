import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/import.me/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://web-backend-lab-1drlinggg.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
