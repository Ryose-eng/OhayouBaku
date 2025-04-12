import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import styled from 'styled-components';

const CreateChat = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatStatus, setChatStatus] = useState(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 初期表示時にチャットの状態を確認
    checkChatStatus();
  }, [user, navigate]);

  const checkChatStatus = async () => {
    try {
      const response = await fetch('http://localhost/api/user-chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        if (data.status === 'active') {
          navigate(`/chat/${data.chatId}`);
        } else if (data.status === 'pending') {
          setChatStatus({
            status: 'pending',
            message: '認証待ち中です。相手からの認証をお待ちください。'
          });
        }
      }
    } catch (error) {
      console.error('チャット状態確認エラー:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/api/chat/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.status === 'active') {
          navigate(`/chat/${data.chatId}`);
        } else {
          setChatStatus({
            status: 'pending',
            message: data.message
          });
        }
      } else {
        setError(data.message || 'エラーが発生しました');
      }
    } catch (error) {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header title="新規チャット" />
      <Sidebar user={user} />
      <MainContent>
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {chatStatus ? '認証状態' : '新しいチャットを開始'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {chatStatus ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p>{chatStatus.message}</p>
              <p className="mt-2">※相手も同じようにあなたのメールアドレスを入力する必要があります。</p>
              <button
                onClick={() => navigate('/posts')}
                className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                投稿一覧に戻る
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  {user.caregiver ? '被介護者' : '介護者'}のメールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? '処理中...' : 'チャットを開始'}
              </button>
            </form>
          )}
        </div>
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
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default CreateChat;
