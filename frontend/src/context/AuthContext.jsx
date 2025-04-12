import React, { createContext, useState, useContext, useEffect } from 'react';

// 認証コンテキストの作成
const AuthContext = createContext(null);

// カスタムフックの作成
export const useAuth = () => useContext(AuthContext);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      fetchUserInfo(token);
    } else {
      setUser(null);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('http://localhost/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('User info fetch error:', error);
      logout();
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // ユーザーが介護者かどうかを判定するヘルパー関数
  const isCaregiver = () => {
    return user?.caregiver === 1 || user?.caregiver === true;
  };

  // 介護者が被介護者と紐付けられているかを判定するヘルパー関数
  const hasCareRecipient = () => {
    if (!user) return false; // ユーザーが未ロードの場合はfalse
    if (!isCaregiver()) return true; // 被介護者の場合は常にtrue
    return user.care_recipient_id != null && user.care_recipient_id !== undefined;
  };

  // デバッグ用のログ出力を改善
  console.log('AuthContext state:', { 
    user, 
    isCaregiver: isCaregiver(), 
    hasCareRecipient: hasCareRecipient(),
    caregiver_value: user?.caregiver,
    care_recipient_id: user?.care_recipient_id 
  });

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      isCaregiver: isCaregiver(),  // 関数の実行結果を渡す
      hasCareRecipient: hasCareRecipient(),  // 関数の実行結果を渡す
      userId: user?.id
    }}>
      {children}
    </AuthContext.Provider>
  );
};