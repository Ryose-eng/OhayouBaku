export const fetchPosts = async () => {
    const response = await fetch("http://localhost/api/posts");
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    return response.json();
  };