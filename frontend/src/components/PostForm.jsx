import React, { useState } from 'react';

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
    <div className="post-form">
      <h3>新規投稿</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="投稿内容"
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "投稿中..." : "投稿"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;