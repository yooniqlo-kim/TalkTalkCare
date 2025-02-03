import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080', // WebSocket 서버 주소와 포트를 여기에 설정
        ws: true, // WebSocket을 활성화
        changeOrigin: true, // 요청 헤더의 원본을 서버로 전달
      },
    },
  },
})