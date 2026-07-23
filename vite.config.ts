import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [vue()],
  build: {
    target: 'es2017',
    cssTarget: 'chrome61'
  }
})
