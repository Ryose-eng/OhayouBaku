import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';
import Dashboard from "./pages/Dashboard";
import ChatRoom from "./pages/ChatRoom";
import CreateChat from "./pages/CreateChat"


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/" element={<Navigate to="/posts" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat/create" element={<ProtectedRoute><CreateChat /></ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/posts" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// 認証された場合にのみアクセスできるルート
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    // ユーザーが認証されていない場合、ログインページにリダイレクト
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default App;
