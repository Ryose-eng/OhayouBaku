import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';

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
            <Route path="*" element={<Navigate to="/posts" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;