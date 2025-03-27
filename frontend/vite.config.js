import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // コンテナ外からのアクセスを許可
    port: 5173, // ポートを明示的に指定
    watch: {
      usePolling: true // ホットリロードを有効にする
    }
  }
})