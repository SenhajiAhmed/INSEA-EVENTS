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
import { ChevronLeft, ChevronRight, PersonOutline, CalendarToday } from '@mui/icons-material';
import { keyframes } from '@mui/system';
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
        fontWeight: 700,
        mb: 4,
        background: 'linear-gradient(90deg, #c084fc, #a855f7, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
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
            <Box key={post.id}
              className="glow-wrapper"
              sx={{
                position: 'relative',
                borderRadius: 2,
                px: 0,
                py: 0,
                // Ambient glow base
                '&:hover': { },
                '&:active': { },
              }}
            >
              {/* Rotating conic-gradient glow ring */}
              <Box
                className="glow-rotator"
                sx={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: 2,
                  background: 'conic-gradient(from 0deg, #FF1493, #FF69B4, #8A2BE2, #9370DB, #00FFFF, #1E90FF, #FF1493)',
                  filter: 'blur(8px)',
                  opacity: 0,
                  animation: `${keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } })} 12s linear infinite` as any,
                  animationPlayState: 'paused',
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                  zIndex: 0,
                  pointerEvents: 'none',
                  // Show only while dragging (active)
                  '.glow-wrapper:active &': {
                    opacity: 0.6,
                    animationDuration: '4s',
                    animationPlayState: 'running',
                    filter: 'blur(10px)'
                  }
                }}
              />
            
              <Card 
                component={Link}
                to={`/blog/${post.slug || post.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(147,51,234,0.25), 0 8px 20px rgba(30,144,255,0.15)'
                  },
                  backgroundImage: 'linear-gradient(180deg, #2A2735, #242132 40%, #1F1C2A 80%, #181624)',
                  color: theme.palette.common.white,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.06)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <CardActionArea 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    flex: 1,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover .media-img': {
                      transform: 'scale(1.06)'
                    },
                    '&:hover .media-overlay': {
                      opacity: 0.35
                    },
                    // Title changes color on hover
                    '&:hover .card-title': {
                      background: 'linear-gradient(90deg, #FF1493, #8A2BE2, #00FFFF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ 
                    width: '100%',
                    height: 200,
                    position: 'relative',
                    backgroundColor: 'rgba(120,100,160,0.12)', // muted purple-grey placeholder bg
                    overflow: 'hidden',
                  }}>
                    {imageLoading[post.id] && (
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height="100%"
                        sx={{ 
                          position: 'absolute', 
                          bgcolor: 'rgba(120,100,160,0.22)'
                        }}
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
                          transition: 'transform 0.35s ease',
                        }}
                        className="media-img"
                      />
                    )}
                    {/* Category chip */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#EAE4FF',
                        background: 'linear-gradient(90deg, rgba(147,51,234,0.85), rgba(168,85,247,0.75))',
                        boxShadow: '0 4px 12px rgba(147,51,234,0.35)'
                      }}
                    >
                      INSEA Events
                    </Box>
                    {/* Hover gradient overlay */}
                    <Box 
                      className="media-overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(120% 60% at 0% 0%, rgba(255,20,147,0.35) 0%, rgba(147,51,234,0.45) 35%, rgba(30,144,255,0.25) 55%, rgba(0,0,0,0) 78%)',
                        mixBlendMode: 'soft-light',
                        opacity: 0,
                        transition: 'opacity 0.35s ease',
                        pointerEvents: 'none'
                      }}
                    />
                    {/* Star field (subtle) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.6) 0, rgba(255,255,255,0) 100%), radial-gradient(1.5px 1.5px at 70% 60%, rgba(0,255,255,0.55) 0, rgba(0,255,255,0) 100%)',
                        opacity: 0.25,
                        pointerEvents: 'none'
                      }}
                    />
                  </Box>
                  
                  {/* Content */}
                  <CardContent sx={{ flex: 1, p: 3, bgcolor: 'rgba(130, 100, 200, 0.04)' }}>
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
                        transition: 'all 0.3s ease',
                      }}
                      className="card-title"
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
                        transition: 'color 0.3s ease',
                        '&:hover': { color: 'text.primary' }
                      }}
                      dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <PersonOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.username || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default BlogView;
