import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/Auth': {
        target: 'http://localhost:5221',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:5221',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:5221',
        changeOrigin: true,
        secure: false,
      },
      '/purchases': {
        target: 'http://localhost:5221',
        changeOrigin: true,
        secure: false,
          },
      '/cart': {
          target: 'http://localhost:5221',
          changeOrigin: true,
          secure: false,
      },
      '/comments': {
          target: 'http://localhost:5221',
          changeOrigin: true,
          secure: false,
      }
    },
  },
})


