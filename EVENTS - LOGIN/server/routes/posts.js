const express = require('express');
const { pool } = require('../utils/dbChecker');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) + '-' + Date.now().toString(36).slice(-6);
}

// Configure multer for this route
const uploadsDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Get all posts with author username - Public access
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all posts...');
        const [posts] = await pool.query(`
            SELECT p.id, p.title, p.content, p.technical_specs, p.quick_info, p.event_program, p.image_path, p.slug, p.created_at, p.updated_at, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        
        console.log(`Found ${posts.length} posts`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }
});

// Get single post by slug - Public access
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('Fetching post by slug:', slug);
        
        const [posts] = await pool.query(`
            SELECT p.id, p.title, p.content, p.technical_specs, p.quick_info, p.event_program, p.image_path, p.slug, p.created_at, p.updated_at, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.slug = ?
        `, [slug]);
        
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(posts[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post', details: error.message });
    }
});

// Create a new post - Protected route with file upload support
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        console.log('=== CREATE POST REQUEST ===');
        console.log('Headers:', req.headers);
        console.log('Body keys:', Object.keys(req.body));
        console.log('File:', req.file ? 'Present' : 'Not present');

        const { title, content, technical_specs, quick_info, event_program } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!title || !content) {
            console.log('Validation failed: missing title or content');
            return res.status(400).json({ 
                error: 'Title and content are required',
                received: { title: !!title, content: !!content }
            });
        }

        if (title.length > 255) {
            return res.status(400).json({ 
                error: 'Title is too long (max 255 characters)' 
            });
        }

        // Handle image file (much simpler!)
        let imagePath = null;
        if (req.file) {
            // Store relative path from uploads directory
            imagePath = `/uploads/${req.file.filename}`;
            console.log('Image uploaded:', imagePath);
        }

        const slug = generateSlug(title);
        console.log('Generated slug:', slug);

        // Insert the post with new fields
        console.log('Inserting post...');
        const [result] = await pool.query(
            'INSERT INTO posts (title, content, technical_specs, quick_info, event_program, image_path, slug, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              title,
              content,
              technical_specs && technical_specs.trim() !== '' ? technical_specs : null,
              quick_info && quick_info.trim() !== '' ? quick_info : null,
              event_program && event_program.trim() !== '' ? event_program : null,
              imagePath,
              slug,
              userId
            ]
        );

        console.log('Post inserted successfully:', result.insertId);

        // Fetch the complete post
        const [posts] = await pool.query(`
            SELECT p.id, p.title, p.content, p.technical_specs, p.quick_info, p.event_program, p.image_path, p.slug, p.created_at, p.updated_at, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [result.insertId]);

        if (posts.length === 0) {
            throw new Error('Failed to retrieve created post');
        }

        console.log('Post retrieved successfully');
        res.status(201).json(posts[0]);

    } catch (error) {
        console.error('Error creating post:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to create post',
            details: error.message 
        });
    }
});

// Get single post by ID
router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching post by ID:', id);
        
        const [posts] = await pool.query(`
            SELECT p.id, p.title, p.content, p.technical_specs, p.quick_info, p.event_program, p.image_path, p.slug, p.created_at, p.updated_at, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [id]);

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post', details: error.message });
    }
});

// Get all posts by the authenticated user - Protected route
router.get('/my-posts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Fetching posts by user ID:', userId);
        
        const [posts] = await pool.query(`
            SELECT p.id, p.title, p.content, p.technical_specs, p.quick_info, p.event_program, p.image_path, p.slug, p.created_at, p.updated_at, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        `, [userId]);
        
        console.log(`Found ${posts.length} posts for user ${userId}`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }
});

// Update a post - Protected route
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating post by ID:', id);
        
        const { title, content, technical_specs, quick_info, event_program } = req.body;
        const userId = req.user.userId;

        // First, verify the post exists and belongs to the user
        const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (posts[0].user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You can only edit your own posts' });
        }

        // Update the post with new fields
        await pool.query(
            'UPDATE posts SET title = ?, content = ?, technical_specs = ?, quick_info = ?, event_program = ? WHERE id = ?',
            [
              title || posts[0].title,
              content || posts[0].content,
              typeof technical_specs === 'string' ? (technical_specs.trim() === '' ? null : technical_specs) : (posts[0].technical_specs ?? null),
              typeof quick_info === 'string' ? (quick_info.trim() === '' ? null : quick_info) : (posts[0].quick_info ?? null),
              typeof event_program === 'string' ? (event_program.trim() === '' ? null : event_program) : (posts[0].event_program ?? null),
              id
            ]
        );

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post', details: error.message });
    }
});

// Delete a post - Protected route
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting post by ID:', id);
        
        const userId = req.user.userId;

        // Verify the post exists and belongs to the user
        const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (posts[0].user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own posts' });
        }

        // Delete the post
        await pool.query('DELETE FROM posts WHERE id = ?', [id]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post', details: error.message });
    }
});

// Test endpoint to verify database schema
router.get('/test/schema', async (req, res) => {
    try {
        // Check if posts table exists and has the correct schema
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM posts
        `);
        
        // Check if we can insert and retrieve a test post
        const testTitle = `Test Post ${Date.now()}`;
        const testSlug = `test-post-${Date.now()}`;
        
        // Insert test post
        const [insertResult] = await pool.query(
            'INSERT INTO posts (title, content, slug, user_id) VALUES (?, ?, ?, ?)',
            [testTitle, 'Test content', testSlug, 1]  // Assuming user with ID 1 exists
        );
        
        // Retrieve the inserted post
        const [posts] = await pool.query(
            'SELECT * FROM posts WHERE id = ?',
            [insertResult.insertId]
        );
        
        // Clean up
        await pool.query('DELETE FROM posts WHERE id = ?', [insertResult.insertId]);
        
        res.status(200).json({
            success: true,
            schema: columns.map(col => ({
                field: col.Field,
                type: col.Type,
                null: col.Null,
                key: col.Key,
                default: col.Default,
                extra: col.Extra
            })),
            testInsert: posts[0] || null
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
