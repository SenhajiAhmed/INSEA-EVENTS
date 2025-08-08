import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import PostEditor from './PostEditor';
import { Post, PostData } from '../../types';

const MyPostsView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State for the editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch('http://localhost:3000/api/posts/my-posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const handleCreateNew = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleEdit = async (postToEdit: Post) => {
    try {
        // The full post content might not be in the list, so we fetch it by ID
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/posts/id/${postToEdit.id}`, {
             headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch post details.');
        const fullPost: Post = await response.json();
        setEditingPost(fullPost);
        setIsEditorOpen(true);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setEditingPost(null);
  };

  const handleSave = async (postData: PostData) => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const isUpdating = postData.id;
      const url = isUpdating ? `http://localhost:3000/api/posts/${postData.id}` : 'http://localhost:3000/api/posts';
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: postData.title, content: postData.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save post');
      }

      setIsEditorOpen(false);
      setEditingPost(null);
      fetchUserPosts(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading your posts...</div>;
  }

  // Keep showing the main view even if there's an error from saving
  return (
    <div className="p-4 md:p-6 text-white">
      {isEditorOpen && (
        <PostEditor 
          post={editingPost}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Button onClick={handleCreateNew}>Create New Post</Button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mb-4">Error: {error}</div>}

      <div className="bg-[#232135] rounded-lg shadow-lg p-4">
        {posts.length === 0 ? (
          <p className="text-gray-400">You haven't created any posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map(post => (
              <li key={post.id} className="p-4 bg-[#181824] rounded-md flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-sm text-gray-400">
                    Last updated: {format(new Date(post.updated_at), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => handleEdit(post)}>Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyPostsView;
