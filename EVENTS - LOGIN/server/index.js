require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const checkAndCreateDatabase = require('./utils/dbChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Check and create database before starting server
async function startServer() {
    try {
        // Get the pool from the database checker
        const pool = await checkAndCreateDatabase();
        
        // Middleware
        app.use(cors());
        app.use(express.json());

        // Routes
        app.use('/api/auth', authRoutes);

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Something went wrong!' });
        });

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
