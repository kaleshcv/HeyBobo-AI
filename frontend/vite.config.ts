import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// Copies pdf.worker.min.mjs to dist/ so it is served at a stable, unhashed URL.
const pdfWorkerPlugin = () => ({
  name: 'pdf-worker-static',
  writeBundle() {
    copyFileSync(
      resolve('./node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
      resolve('./dist/pdf.worker.min.mjs'),
    )
  },
})

export default defineConfig({
  plugins: [react(), pdfWorkerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['@headlessui/react', 'lucide-react'],
        },
      },
    },
  },
})
