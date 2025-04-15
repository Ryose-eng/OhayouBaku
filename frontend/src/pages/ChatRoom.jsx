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
            setMessages(prevMessages => {
              const messageExists = prevMessages.some(msg => msg.id === message.id);
              if (messageExists) return prevMessages;
              return [...prevMessages, {
                ...message,
                is_mine: message.user_id === userId
              }];
            });
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
      <Header title={`${partner.name || 'User'}とのチャット`} />
      <Sidebar user={user} />
      <MainContent>
        <MessagesContainer>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <MessageWrapper key={index} isMine={msg.is_mine}>
                <MessageBubble isMine={msg.is_mine}>
                  <div>{msg.content}</div>
                  <MessageTime isMine={msg.is_mine}>
                    {formatDate(msg.created_at)}
                  </MessageTime>
                </MessageBubble>
              </MessageWrapper>
            ))
          ) : (
            <EmptyMessage>
              メッセージを送信して会話を始めましょう
            </EmptyMessage>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputFormContainer>
          <InputForm onSubmit={sendMessage}>
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
            />
            <SendButton type="submit" disabled={!newMessage.trim()}>
              送信
            </SendButton>
          </InputForm>
        </InputFormContainer>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background-color: #f0f8ff;
  color: #333;
`;

const MainContent = styled.main`
  grid-area: main;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px); // ヘッダーとフッターの高さを考慮
  position: relative;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  margin-bottom: 80px; // 入力フォームの高さ分の余白
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #666;
  margin: 2rem 0;
  font-size: 1.1rem;
`;

const InputFormContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
`;

const InputForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #0078a8;
    box-shadow: 0 0 0 2px rgba(0, 120, 168, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0078a8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #006691;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.isMine ? 'flex-end' : 'flex-start'};
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0'};
  background-color: ${props => props.isMine ? '#0078a8' : 'white'};
  color: ${props => props.isMine ? 'white' : '#333'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.isMine ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  margin-top: 0.25rem;
  text-align: ${props => props.isMine ? 'right' : 'left'};
`;

export default ChatRoom;
