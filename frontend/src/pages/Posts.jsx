import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost/api/posts", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log('れすぽんすでーた',data);
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

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    fetchPosts();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // ユーザーがログインしていない場合は何も表示しない（useEffectでリダイレクト）
  }

  return (
    <div className="posts-page">
      <div className="header">
        <h2>投稿一覧</h2>
        <button onClick={handleLogout} className="logout-button">
          ログアウト
        </button>
      </div>

      <PostForm onPostCreated={handlePostCreated} />

      <div className="posts-list">
        {isLoading ? (
          <p>読み込み中...</p>
        ) : posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id} className="post-item">
                <div className="post-header">
                  <strong>{post.user.name}</strong>
                  <span className="post-date">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="post-body">{post.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>投稿がありません</p>
        )}
      </div>
    </div>
  );
};

export default Posts;