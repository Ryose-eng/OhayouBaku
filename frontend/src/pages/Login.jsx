import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        login(data.token);
        navigate('/posts');
      } else {
        setErrors(data.errors || { message: "ログインに失敗しました" });
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      setErrors({ message: "ログイン中にエラーが発生しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>ログイン</h2>
      
      {errors.message && <div className="error-message">{errors.message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
        
        <p className="auth-link">
          アカウントがない場合は<Link to="/register">登録</Link>してください
        </p>
      </form>
    </div>
  );
};

export default Login;