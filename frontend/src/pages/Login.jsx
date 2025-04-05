import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

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
      
      if (response.ok && data.token && data.user) {
        login(data.user, data.token); // トークンを保存してログイン状態にする
        navigate('/posts'); // 成功したらpostsページにリダイレクト
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
    <Container>
      <FormCard>
        <Title>ログイン</Title>
        
        {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">メールアドレス</Label>
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">パスワード</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
          
          <LinkContainer>
            <StyledLink to="/register">
              アカウントがない場合は登録してください
            </StyledLink>
          </LinkContainer>
        </Form>
      </FormCard>
    </Container>
  );
};

// Styled Components (スタイル定義)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f8ff;
  padding: 20px;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 160, 220, 0.15);
  padding: 30px;
  width: 100%;
  max-width: 450px;
  border-top: 5px solid #4cb8e6;
`;

const Title = styled.h1`
  color: #0077b6;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #cce5ff;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4cb8e6;
    box-shadow: 0 0 0 3px rgba(76, 184, 230, 0.2);
  }
`;

const Button = styled.button`
  background-color: #4cb8e6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  
  &:hover {
    background-color: #3aa0d1;
  }
  
  &:disabled {
    background-color: #a0d8ef;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 2px;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 15px;
`;

const StyledLink = styled(Link)`
  color: #4cb8e6;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Login;