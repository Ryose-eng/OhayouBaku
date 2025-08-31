const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fetch = require('node-fetch');  // fetchを使用する場合は必要

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://ohayoubaku-frontend-q8b6.onrender.com',
      'https://ohayoubaku-backend-q8b6.onrender.com'
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['polling', 'websocket'],  // ポーリングを優先
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,  // アップグレードタイムアウト
  maxHttpBufferSize: 1e6,  // バッファサイズ
  serveClient: false  // クライアントファイルの配信を無効化
});

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'dist')));

// すべてのリクエストをindex.htmlにリダイレクト（SPA対応）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// WebSocket接続処理
io.on('connection', (socket) => {
  console.log('新しいクライアント接続:', socket.id);
  
  const chatId = socket.handshake.query.chatId;
  if (chatId) {
    socket.join(chatId);
    console.log(`クライアント ${socket.id} がルーム ${chatId} に参加`);
  }
  
  socket.on('sendMessage', async (messageData) => {
    console.log('メッセージを受信:', messageData);
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
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('APIレスポンス:', data);

      // 全員（送信者含む）にメッセージをブロードキャスト
      io.to(messageData.chatId).emit('receiveMessage', {
        id: data.message.id,
        content: messageData.content,
        chat_id: messageData.chatId,
        user_id: data.message.user_id,
        created_at: data.message.created_at,
        is_mine: false
      });

    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      socket.emit('messageError', { 
        error: 'メッセージを送信できませんでした',
        details: error.message 
      });
    }
  });
});

const PORT = process.env.PORT || 4173;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}); 