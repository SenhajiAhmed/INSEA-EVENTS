import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { PostData, Post } from '../../types';

interface PostEditorProps {
  post?: Post | null;
  onSave: (post: PostData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [post]);

  const handleSave = () => {
    onSave({ ...post, title, content });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#232135] p-6 rounded-lg shadow-xl w-full max-w-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">{post ? 'Edit Post' : 'Create New Post'}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="bg-[#181824] border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="bg-[#181824] border-gray-600 min-h-[200px]"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
