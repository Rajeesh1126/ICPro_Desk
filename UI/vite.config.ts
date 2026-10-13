import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Heavy, page-specific libraries get their own chunks: xlsx loads
          // only when a user exports; echarts only with the chart pages.
          if (/node_modules[\\/]xlsx[\\/]/.test(id)) {
            return 'xlsx';
          }
          if (/node_modules[\\/](echarts|zrender)[\\/]/.test(id)) {
            return 'charts';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
