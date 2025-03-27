import { useEffect, useState } from "react";
import { fetchPosts } from "../api";
import styled from "styled-components";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts()
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container>
      <Title>投稿一覧</Title>
      <PostListWrapper>
        {posts.map((post) => (
          <PostItem key={post.id}>
            <Username>{post.username}</Username>
            <Date>({post.created_at})</Date>
            <PostBody>{post.body}</PostBody>
          </PostItem>
        ))}
      </PostListWrapper>
    </Container>
  );
};

// style
const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #2d3748;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const PostListWrapper = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const PostItem = styled.li`
  background-color: #fff;
  margin-bottom: 15px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const Username = styled.strong`
  color: #3182ce;
  font-size: 1.1rem;
`;

const Date = styled.span`
  color: #718096;
  font-size: 0.9rem;
  margin-left: 10px;
`;

const PostBody = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  color: #2d3748;
  margin-top: 10px;
`;

export default PostList;
