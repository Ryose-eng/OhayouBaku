import React, { createContext, useState, useContext, useEffect } from 'react';

// 認証コンテキストの作成
const AuthContext = createContext(null);

// カスタムフックの作成
export const useAuth = () => useContext(AuthContext);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 初期レンダリング時にlocalStorageからトークンをチェック
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(true); // トークンがある場合はユーザーを認証された状態にする
    } else {
      setUser(false); // トークンがなければ未認証
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token); // トークンをlocalStorageに保存
    setUser(true); // ユーザーを認証された状態にする
  };

  const logout = () => {
    localStorage.removeItem('token'); // localStorageからトークンを削除
    setUser(false); // ユーザーを未認証状態にする
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};