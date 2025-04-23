import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Server } from 'socket.io'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'socket-io',
      configureServer(server) {
        if (!server.httpServer) {
          throw new Error('HTTP server not found')
        }

        const io = new Server(server.httpServer, {
          cors: {
            origin: [process.env.VITE_API_URL || "http://localhost:5173", process.env.FRONTEND_URL || "http://localhost"],
            methods: ["GET", "POST"],
            credentials: true
          }
        })

        io.on('connection', (socket) => {
          console.log('新しいクライアント接続:', socket.id)
          
          // チャットルームに参加
          const chatId = socket.handshake.query.chatId
          if (chatId) {
            socket.join(chatId)
            console.log(`クライアント ${socket.id} がルーム ${chatId} に参加`)
          }
          
          socket.on('sendMessage', async (messageData) => {
            console.log('メッセージを受信:', messageData)
            try {
              const response = await fetch(`${process.env.VITE_API_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${messageData.token}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  chat_id: messageData.chatId,
                  content: messageData.content
                })
              })

              if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
              }

              const data = await response.json()
              console.log('APIレスポンス:', data)

              // 全員（送信者含む）にメッセージをブロードキャスト
              io.to(messageData.chatId).emit('receiveMessage', {
                id: data.message.id,
                content: messageData.content,
                chat_id: messageData.chatId,
                user_id: data.message.user_id,
                created_at: data.message.created_at,
                is_mine: false
              })

            } catch (error) {
              console.error('メッセージ送信エラー:', error)
              socket.emit('messageError', { 
                error: 'メッセージを送信できませんでした',
                details: error.message 
              })
            }
          })
        })
      },
      buildStart() {
        console.log('Viteプラグインが初期化されました')
      }
    }
  ],
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: [
      'ohayoubaku-frontend-q8b6.onrender.com',
      '.onrender.com'
    ]
  },
  server: {
    host: true,
    port: process.env.PORT || 5173,
    watch: {
      usePolling: true
    }
  }
})