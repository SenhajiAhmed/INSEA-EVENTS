import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Skeleton, 
  CircularProgress,
  IconButton,
  useTheme
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format } from 'date-fns';
import { Post } from '../../types';

const BlogView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const sliderRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
        
        // Initialize loading state for all images
        const loadingState = data.reduce((acc: { [key: number]: boolean }, post: Post) => {
          if (post.image_path) acc[post.id] = true;
          return acc;
        }, {});
        setImageLoading(loadingState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleImageLoad = (postId: number) => {
    setImageLoading(prev => ({ ...prev, [postId]: false }));
  };

  const scrollByCards = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const cardWidth = 320 + 16; // card width + gap
    const delta = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    el.scrollBy({ left: delta * -1, behavior: 'smooth' }); // invert for RTL container
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} bgcolor="error.background" color="error.contrastText" borderRadius={2}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'text.primary',
        mb: 4
      }}>
        Latest Blog Posts
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {/* Left Arrow */}
        <IconButton
          onClick={() => scrollByCards('left')}
          sx={{
            position: 'absolute',
            left: { xs: -12, sm: -16 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            [theme.breakpoints.down('sm')]: {
              width: 32,
              height: 32,
              '& svg': { fontSize: 20 }
            }
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* Right Arrow */}
        <IconButton
          onClick={() => scrollByCards('right')}
          sx={{
            position: 'absolute',
            right: { xs: -12, sm: -16 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            [theme.breakpoints.down('sm')]: {
              width: 32,
              height: 32,
              '& svg': { fontSize: 20 }
            }
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Posts Slider */}
        <Box
          ref={sliderRef}
          sx={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome/Safari
            py: 1,
            px: 1,
            mx: -1,
            '& > *': {
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: { xs: 280, sm: 320 },
            }
          }}
        >
          {posts.map((post) => (
            <Card 
              key={post.id}
              component={Link}
              to={`/blog/${post.slug || post.id}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textDecoration: 'none',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <CardActionArea 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  flex: 1,
                }}
              >
                {/* Image */}
                <Box sx={{ 
                  width: '100%',
                  height: 200,
                  position: 'relative',
                  backgroundColor: theme.palette.action.hover,
                }}>
                  {imageLoading[post.id] && (
                    <Skeleton 
                      variant="rectangular" 
                      width="100%" 
                      height="100%"
                      sx={{ position: 'absolute' }}
                    />
                  )}
                  {post.image_path && (
                    <Box
                      component="img"
                      src={`http://localhost:3000${post.image_path}`}
                      alt={post.title}
                      onLoad={() => handleImageLoad(post.id)}
                      onError={() => handleImageLoad(post.id)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: imageLoading[post.id] ? 'none' : 'block',
                      }}
                    />
                  )}
                </Box>
                
                {/* Content */}
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '3.6em',
                      lineHeight: '1.2em',
                    }}
                  >
                    {post.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 2,
                      minHeight: '4.5em',
                      lineHeight: '1.5em',
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') }}
                  />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                    <Typography variant="caption" color="text.secondary">
                      {post.username || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default BlogView;
