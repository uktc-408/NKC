import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  root: '',
  base: '/',
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        demo: './index.html',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除所有 console.*
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'] // 或者只移除 console.log
      }
    }
  },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    glsl(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html
          .replace(
            /<title>(.*?)<\/title>/,
            '<title>PolizAI</title>'
          )
          .replace(
            /<link rel="icon"(.*?)>/,
            '<link rel="icon" href="../public/logo.png">'
          )
      }
    }
  ],
})