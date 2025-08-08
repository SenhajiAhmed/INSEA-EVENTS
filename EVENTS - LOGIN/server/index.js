const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
// Routes will be required after DB connection
const { checkAndCreateDatabase } = require('./utils/dbChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Check and create database before starting server
async function startServer() {
    try {
        // Get the pool from the database checker
        const pool = await checkAndCreateDatabase();
        
        // Middleware - increased limits for image uploads
        app.use(cors({
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true
        }));
        app.use(express.json({ limit: '50mb' }));
        app.use(express.urlencoded({ limit: '50mb', extended: true }));
        app.use(express.raw({ type: 'application/json', limit: '50mb' }));

        // Serve uploaded images statically
        app.use('/uploads', express.static(uploadsDir));

        // Request logging middleware
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            console.log('Headers:', req.headers);
            console.log('Body keys:', Object.keys(req.body || {}));
            if (req.body?.image) {
                console.log('Image data length:', req.body.image.length);
            }
            next();
        });

        // Routes - Load them now that the DB is ready
        const authRoutes = require('./routes/auth');
        const postsRoutes = require('./routes/posts');
        app.use('/api/auth', authRoutes);
        app.use('/api/posts', postsRoutes);

        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('Server Error:', err);
            console.error('Stack:', err.stack);
            res.status(err.status || 500).json({ 
                error: err.message || 'Internal server error',
                timestamp: new Date().toISOString()
            });
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('CORS enabled for: http://localhost:5173, http://localhost:3000');
            console.log('JSON body limit: 50MB');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
