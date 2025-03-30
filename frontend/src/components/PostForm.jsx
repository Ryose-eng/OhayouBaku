import React, { useState } from 'react';
import styled from 'styled-components';

const PostForm = ({ onPostCreated }) => {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ body }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setBody("");
        onPostCreated(newPost);
      } else {
        alert("投稿に失敗しました");
      }
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>新規投稿</FormTitle>
      <Form onSubmit={handleSubmit}>
        <TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="投稿内容"
          required
        />
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "投稿中..." : "投稿"}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  background-color: #e6f7ff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #0078a8;
  font-size: 1.2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #b3e0ff;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 15px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4aa3df;
    box-shadow: 0 0 0 2px rgba(74, 163, 223, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: #4aa3df;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: 600;
  align-self: flex-end;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3498db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background-color: #b3e0ff;
    cursor: not-allowed;
  }
`;

export default PostForm;