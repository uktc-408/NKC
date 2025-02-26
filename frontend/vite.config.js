import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  root: '',
  // Set the base URL to your repository name, with leading and trailing slashes.
  base: '/NKC/', 
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
        drop_console: true,  // Remove all console.*
        drop_debugger: true, // Remove debugger
        pure_funcs: ['console.log'] // Or just remove console.log
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
          // If your logo is in the public folder, reference it with an absolute path.
          .replace(
            /<link rel="icon"(.*?)>/,
            '<link rel="icon" href="/NKC/logo.png">'

          )
      }
    }
  ],
})
