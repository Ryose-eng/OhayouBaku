import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
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
      const response = await fetch("http://localhost/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: passwordConfirmation 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        login(data.token);
        navigate('/posts');
      } else {
        setErrors(data.errors || { message: "登録に失敗しました" });
      }
    } catch (error) {
      console.error("登録エラー:", error);
      setErrors({ message: `登録中にエラーが発生しました: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>ユーザー登録</h2>
      
      {errors.message && <div className="error-message">{errors.message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">名前</label>
          <input
            id="name"
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        
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
        
        <div className="form-group">
          <label htmlFor="password_confirmation">パスワード確認</label>
          <input
            id="password_confirmation"
            type="password"
            placeholder="パスワード確認"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "登録中..." : "登録"}
        </button>
        
        <p className="auth-link">
          既にアカウントをお持ちの方は<Link to="/login">ログイン</Link>してください
        </p>
      </form>
    </div>
  );
};

export default Register;