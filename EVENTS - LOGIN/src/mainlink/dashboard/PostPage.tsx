import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
}

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) return <p className="text-center text-white">Loading post...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!post) return <p className="text-center text-white">Post not found.</p>;

  return (
    <div className="p-6 md:p-10 bg-[#181824] text-white min-h-screen">
        <Link to="/blog" className="text-purple-400 hover:underline mb-8 block">&larr; Back to Blog</Link>
        <article className="max-w-4xl mx-auto bg-[#232135] p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-300 mb-4">{post.title}</h1>
            <p className="text-gray-400 mb-8">Published on {new Date(post.created_at).toLocaleDateString()}</p>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    </div>
  );
};

export default PostPage;
