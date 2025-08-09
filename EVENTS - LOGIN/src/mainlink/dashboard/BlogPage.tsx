import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/posts/');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center text-white">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-[#181824] text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Blog</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link to={`/post/${post.slug}`} key={post.id} className="block p-6 bg-[#232135] rounded-lg shadow-lg hover:bg-purple-900/50 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-purple-300">{post.title}</h2>
            <p className="text-gray-400 mt-2">Published on {new Date(post.created_at).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
