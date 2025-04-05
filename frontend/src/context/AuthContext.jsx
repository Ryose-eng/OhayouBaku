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
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data); 
      } else {
        setUser(null); 
      }
    } catch (error) {
      setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};