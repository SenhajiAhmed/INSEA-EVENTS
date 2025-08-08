import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Paper,
  Chip,
  Avatar,
  Skeleton
} from '@mui/material';
import { format } from 'date-fns';
import { ArrowBack, FormatQuote } from '@mui/icons-material';
import { Post } from '../types';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch post');
        }
        const data: Post = await response.json();
        setPost(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ 
              mt: 2,
              background: 'linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7c3aed 30%, #9333ea 90%)',
              }
            }}
          >
            Back to Blog
          </Button>
        </Container>
      </Box>
    );
  }

  if (!post) return null;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white'
      }}
    >
      {/* Navigation */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back to Blog
        </Button>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              lineHeight: 1.1,
              background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            {post.title}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Unite, Celebrate, Inspire
          </Typography>

          {/* Featured Image */}
          {post.image_path && (
            <Box
              sx={{
                mb: 4,
                maxWidth: '100%',
                mx: 'auto',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                position: 'relative', // For skeleton positioning
                width: { xs: '100%', sm: '90%', md: '80%', lg: '70%' },
                aspectRatio: { xs: '4/3', sm: '16/10', md: '16/9' },
              }}
            >
              {imageLoading && (
                <Skeleton 
                  variant="rectangular" 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%',
                  }}
                />
              )}
              <Box
                component="img"
                src={`http://localhost:3000${post.image_path}`}
                alt={post.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: imageLoading ? 'none' : 'block',
                  margin: '0 auto',
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }}
                onLoad={handleImageLoad}
                onError={handleImageLoad} // Stop loading on error as well
              />
            </Box>
          )}

          {/* Author Info */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: '#8b5cf6' }}>
              {(post?.username?.charAt(0) ?? '').toUpperCase()}
            </Avatar>
            <Box textAlign="left">
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                {post?.username ?? 'Unknown'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Quote Section */}
        <Paper 
          elevation={0}
          sx={{ 
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 3,
            p: 6,
            mb: 8,
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <FormatQuote 
            sx={{ 
              fontSize: 60,
              color: '#8b5cf6',
              mb: 2,
              opacity: 0.7
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{ 
              fontStyle: 'italic',
              color: 'white',
              mb: 3,
              lineHeight: 1.4,
              fontWeight: 300
            }}
          >
            "Every great story begins with an emotion. Whether it's the joy of a child's laughter, the serenity of a misty morning, or the awe of storm clouds gathering—technical skills are merely the vehicle for expressing what we feel."
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}
          >
            — {post?.username ?? 'Unknown'}
          </Typography>
        </Paper>

        {/* Content Sections */}
        <Box sx={{ mb: 8 }}>
          {/* Technical Foundation Section */}
          <Paper 
            elevation={0}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              p: 6,
              mb: 6
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                mb: 4
              }}
            >
              The Technical Foundation
            </Typography>
            <Box 
              component="div"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.8,
                '& p': { mb: 3 },
                '& h2': { mt: 4, mb: 2, fontWeight: 'bold', color: 'white' },
                '& h3': { mt: 3, mb: 1.5, fontWeight: 'bold', color: 'white' },
                '& a': { 
                  color: '#8b5cf6', 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' } 
                },
                '& ul, & ol': { pl: 4, mb: 2 },
                '& li': { mb: 1 },
                '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 3 },
                '& blockquote': {
                  borderLeft: '4px solid #8b5cf6',
                  pl: 3,
                  py: 1,
                  my: 3,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontStyle: 'italic',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 1
                },
                '& pre': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  p: 2,
                  borderRadius: 2,
                  overflowX: 'auto',
                  my: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                },
                '& code': {
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#e2e8f0',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.9em'
                }
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Paper>

          {/* Call to Action */}
          <Paper 
            elevation={0}
            sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
              mb: 6
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                mb: 2
              }}
            >
              Start Your Journey
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Ready to capture your own moments and create lasting memories? Join our community of passionate photographers and discover new perspectives.
            </Typography>
            <Button 
              variant="contained"
              size="large"
              onClick={() => navigate('/blog')}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Learn More
            </Button>
          </Paper>

          {/* Updated info */}
          {post.updated_at !== post.created_at && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip 
                label={`Updated ${format(new Date(post.updated_at), 'MMMM d, yyyy')}`}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default BlogPostPage;
