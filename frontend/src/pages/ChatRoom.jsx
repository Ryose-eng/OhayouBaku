import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import dayjs from 'dayjs'; // 日付フォーマット用
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import styled from 'styled-components';

const ChatRoom = () => {
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partner, setPartner] = useState({});
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { userId } = useAuth();

  useEffect(() => {
    const initChat = async () => {
      try {
        const response = await fetch(`http://localhost/api/chat/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setPartner(data.partner);
          setMessages(data.messages);

          // Socket.IO接続を修正
          const newSocket = io('ws://localhost:5173', {
            transports: ['websocket'],
            query: { chatId },
            withCredentials: true
          });

          newSocket.on('connect', () => {
            console.log('Socket connected successfully with ID:', newSocket.id);
          });

          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
          });

          newSocket.on('error', (error) => {
            console.error('Socket error:', error);
          });

          newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
              newSocket.connect();
            }
          });

          newSocket.on('receiveMessage', (message) => {
            console.log('新しいメッセージを受信:', message);
            setMessages(prevMessages => [...prevMessages, {
              ...message,
              is_mine: message.user_id === userId  // 自分のメッセージかどうかを判定
            }]);
          });

          newSocket.on('messageError', (error) => {
            console.error('Message error details:', error);
            setError(error.error + (error.details ? `: ${error.details}` : ''));
          });

          // デバッグ用のイベントリスナー
          newSocket.onAny((eventName, ...args) => {
            console.log('送信したイベント:', eventName, args);
          });

          setSocket(newSocket);
          setLoading(false);

          return () => {
            if (newSocket) newSocket.disconnect();
          };
        } else {
          setError('チャットルームが見つかりませんでした');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('エラーが発生しました');
        setLoading(false);
      }
    };

    initChat();
  }, [chatId, token, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    console.log('Attempting to send message:', {
      chatId,
      content: newMessage,
      token
    });

    try {
      if (!socket.connected) {
        console.error('Socket is not connected');
        return;
      }
      socket.emit('sendMessage', {
        chatId,
        content: newMessage,
        token
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('メッセージを送信できませんでした: ' + error.message);
    }
  };

  // メッセージの日付フォーマット用関数
  const formatDate = (dateString) => {
    return dayjs(dateString).format('YYYY/MM/DD HH:mm');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <AppContainer>
      <Header title={`Chat with ${partner.name || 'User'}`} />
      <Sidebar user={user} />
      <MainContent>
        {/* ヘッダー */}
        <div className="bg-blue-500 text-white p-4 flex items-center">
          <div className="w-10 h-10 rounded-full bg-white text-blue-500 flex items-center justify-center font-bold">
            {partner.name ? partner.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="ml-3">
            <div className="font-bold">{partner.name || 'ユーザー'}</div>
            <div className="text-sm opacity-75">{partner.email}</div>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    msg.is_mine ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  <div>{msg.content}</div>
                  <div className={`text-xs mt-1 ${msg.is_mine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatDate(msg.created_at)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 my-8">メッセージを送信して会話を始めましょう</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力 */}
        <form onSubmit={sendMessage} className="bg-white border-t p-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
          >
            送信
          </button>
        </form>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.div`
  flex-grow: 1;
`;

export default ChatRoom;
