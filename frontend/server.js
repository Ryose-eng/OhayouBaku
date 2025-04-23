const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.VITE_API_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket接続処理
io.on('connection', (socket) => {
  console.log('新しいクライアント接続:', socket.id);
  
  const chatId = socket.handshake.query.chatId;
  if (chatId) {
    socket.join(chatId);
    console.log(`クライアント ${socket.id} がルーム ${chatId} に参加`);
  }
  
  socket.on('sendMessage', async (messageData) => {
    // vite.config.jsからメッセージ処理のコードを移植
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 