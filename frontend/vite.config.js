import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/']
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // En desarrollo, redirige /api al backend Express
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[PROXY] ${req.method} ${req.url}`)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[PROXY] Response: ${proxyRes.statusCode} ${req.url}`)
          })
          proxy.on('error', (err, req, res) => {
            console.error(`[PROXY] Error: ${err.message}`)
          })
        }
      },
    },
  },
})
