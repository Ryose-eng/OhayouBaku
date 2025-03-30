import React, { createContext, useState, useContext } from 'react';

// 認証コンテキストの作成
const AuthContext = createContext(null);

// カスタムフックの作成
export const useAuth = () => useContext(AuthContext);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('token') ? true : false);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};