import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
  server: {
    proxy: {
      '/youke1': {
        target: 'https://youke1.picui.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/youke1/, ''),
      },
    },
  },
})
