import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isCaregiver, setIsCaregiver] = useState(false);  // 介護者フラグ
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
          password_confirmation: passwordConfirmation,
          caregiver: isCaregiver  // 介護者フラグを送信
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        login(data.user, data.token);
        navigate('/posts');
      } else {
        setErrors(data.errors || { message: data.message });
      }
    } catch (error) {
      console.error("登録エラー:", error);
      setErrors({ message: `登録中にエラーが発生しました: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>ユーザー登録</Title>
        
        {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>名前</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>メールアドレス</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>パスワード</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>パスワード（確認）</Label>
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={isCaregiver}
                onChange={(e) => setIsCaregiver(e.target.checked)}
              />
              介護者として登録する
            </CheckboxLabel>
          </FormGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録"}
          </Button>
          
          <LoginLink>
            すでにアカウントをお持ちの方は<Link to="/login">こちら</Link>
          </LoginLink>
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
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

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 2px;
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #4cb8e6;

  a {
    color: #4cb8e6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Register;