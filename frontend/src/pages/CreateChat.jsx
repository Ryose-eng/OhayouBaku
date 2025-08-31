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
  const { user, token, updateUser } = useAuth();

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-chat`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/create`, {
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
          await updateUser();
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
        <FormContainer>
          <FormTitle>
            {chatStatus ? '認証状態' : '新しいチャットを開始'}
          </FormTitle>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          {chatStatus ? (
            <StatusContainer>
              <StatusMessage>{chatStatus.message}</StatusMessage>
              <InfoMessage>※相手も同じようにあなたのメールアドレスを入力する必要があります。</InfoMessage>
              <Button onClick={() => navigate('/posts')}>
                投稿一覧に戻る
              </Button>
            </StatusContainer>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="email">
                  {user.caregiver ? '被介護者' : '介護者'}のメールアドレス
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormGroup>

              <Button type="submit" disabled={loading}>
                {loading ? '処理中...' : 'チャットを開始'}
              </Button>
            </Form>
          )}
        </FormContainer>
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

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #0078a8;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0078a8;
    box-shadow: 0 0 0 2px rgba(0, 120, 168, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #0078a8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #006691;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 4px;
  color: #dc2626;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusMessage = styled.p`
  color: #0078a8;
  font-size: 1.1rem;
  text-align: center;
`;

const InfoMessage = styled.p`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
`;

export default CreateChat;
