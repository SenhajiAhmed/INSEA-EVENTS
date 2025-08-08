import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Skeleton, 
  CircularProgress,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Post } from '../types';
import { format } from 'date-fns';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const cardWidth = 320 + 16; // card width + gap
    const delta = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: delta * -1, behavior: 'smooth' }); // invert for RTL container
  };

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:3000/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data: Post[] = await response.json();
        setPosts(data);
        const initialLoadingState = data.reduce((acc, post) => {
          if (post.image_path) {
            acc[post.id] = true;
          }
          return acc;
        }, {} as { [key: number]: boolean });
        setImageLoading(initialLoadingState);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError('Error loading posts. Please try again later.');
        console.error('Error:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleImageLoad = (postId: number) => {
    setImageLoading(prev => ({ ...prev, [postId]: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
        Latest Posts
      </Typography>

      {/* Horizontal slider of vertical fixed-size cards (RTL) */}
      <Box sx={{ position: 'relative' }}>
        {/* Controls */}
        <IconButton 
          onClick={() => scrollByCards('left')} 
          size="small"
          sx={{ position: 'absolute', top: '50%', left: -8, transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', boxShadow: 1 }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton 
          onClick={() => scrollByCards('right')} 
          size="small"
          sx={{ position: 'absolute', top: '50%', right: -8, transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', boxShadow: 1 }}
        >
          <ChevronRight />
        </IconButton>

        <Box 
          ref={sliderRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            px: 1,
            pb: 1,
            direction: 'rtl',
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 }
          }}
        >
          {posts.map((post) => (
            <Card 
              key={post.id}
              sx={{
                minWidth: 320,
                maxWidth: 320,
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <CardActionArea sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {/* Fixed-height image container; image fits (contain) */}
                <Box 
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {imageLoading[post.id] && (
                    <Skeleton 
                      variant="rectangular" 
                      sx={{ position: 'absolute', inset: 0 }}
                    />
                  )}
                  {post.image_path && (
                    <Box
                      component="img"
                      src={`http://localhost:3000${post.image_path}`}
                      alt={post.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: imageLoading[post.id] ? 'none' : 'block',
                        backgroundColor: 'transparent'
                      }}
                      onLoad={() => handleImageLoad(post.id)}
                      onError={() => handleImageLoad(post.id)}
                    />
                  )}
                </Box>

                <CardContent sx={{ width: '100%' }} dir="ltr">
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Posted by {post?.username ?? 'Unknown'} • {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.content.length > 140 ? `${post.content.substring(0, 140)}...` : post.content}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default BlogPage;
