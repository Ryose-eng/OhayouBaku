import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import styled from 'styled-components';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        // トークンが無効な場合、ログアウトさせる
        console.log('レスポンスエラー:', response.status);
        logout();
        navigate('/login');
      }
    } catch (error) {
      console.error("投稿取得エラー:", error);
      logout();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPosts();
  }, [user, navigate, logout]);

  const handlePostCreated = async (newPost) => {
    const postId = newPost.id;
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
        credentials: "include",
      });
  
      if (response.ok) {
        const newPostFromServer = await response.json();
        setPosts(prevPosts => [newPostFromServer, ...prevPosts]);
      } else {
        console.error('新しい投稿の取得に失敗しました');
      }
    } catch (error) {
      console.error("新しい投稿取得エラー:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // ユーザーがログインしていない場合は何も表示しない（useEffectでリダイレクト）
  }

  return (
    <AppContainer>
      <Header title="投稿一覧" onLogout={handleLogout} />
      <Sidebar user={user} />
      <MainContent>
        <PostForm onPostCreated={handlePostCreated} />
        
        <PostsListContainer>
          {isLoading ? (
            <LoadingText>読み込み中...</LoadingText>
          ) : posts.length > 0 ? (
            <PostsList>
              {posts.map((post) => (
                <PostItem key={post.id}>
                  <PostHeader>
                    <PostAuthor>{post.user.name}</PostAuthor>
                    <PostDate>
                      {new Date(post.created_at).toLocaleString()}
                    </PostDate>
                  </PostHeader>
                  <PostBody>{post.body}</PostBody>
                </PostItem>
              ))}
            </PostsList>
          ) : (
            <NoPostsText>投稿がありません</NoPostsText>
          )}
        </PostsListContainer>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

// スタイル定義
const AppContainer = styled.div`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background-color: #f0f8ff; /* 薄い水色の背景 */
  color: #333;
`;

const MainContent = styled.main`
  grid-area: main;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 10px;
  border-radius: 8px;
`;

const PostsListContainer = styled.div`
  margin-top: 20px;
`;

const PostsList = styled.ul`
  grid-column: 1/ -1;
  list-style: none;
  padding: 0;
`;

const PostItem = styled.li`
  background-color: #e6f7ff; /* より薄い水色 */
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #b3e0ff; /* 水色のボーダー */
`;

const PostAuthor = styled.strong`
  color: #0078a8; /* 深い水色 */
`;

const PostDate = styled.span`
  color: #777;
  font-size: 0.9em;
`;

const PostBody = styled.p`
  margin: 0;
  line-height: 1.5;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #0078a8;
  font-size: 1.1em;
`;

const NoPostsText = styled.p`
  text-align: center;
  color: #555;
  font-style: italic;
`;

export default Posts;