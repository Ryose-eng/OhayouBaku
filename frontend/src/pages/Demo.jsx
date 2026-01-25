import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Demo = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('ログイン中...');

  useEffect(() => {
    const autoLogin = async () => {
      try {
        setStatus('ログイン中...');
        
        // デモ用のアカウント情報
        const demoEmail = 'hikaigo-demo@example.com';
        const demoPassword = 'demohikaigo1234';

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        });

        const data = await response.json();

        if (response.ok && data.token && data.user) {
          login(data.user, data.token);
          setStatus('リダイレクト中...');
          setTimeout(() => {
            navigate('/posts');
          }, 500);
        } else {
          setStatus('ログインに失敗しました。デモアカウントが存在しない可能性があります。');
        }
      } catch (error) {
        console.error('デモログインエラー:', error);
        setStatus('ログイン中にエラーが発生しました。');
      }
    };

    autoLogin();
  }, [login, navigate]);

  return (
    <Container>
      <StatusCard>
        <StatusText>{status}</StatusText>
      </StatusCard>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f8ff;
  padding: 20px;
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 160, 220, 0.15);
  padding: 40px;
  text-align: center;
  max-width: 500px;
  border-top: 5px solid #4cb8e6;
`;

const StatusText = styled.p`
  color: #0077b6;
  font-size: 1.2rem;
  margin: 0;
`;

export default Demo;
