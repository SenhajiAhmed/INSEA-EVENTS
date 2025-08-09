const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const [existingUser] = await db.pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (is_admin defaults to 0 in DB)
        const [result] = await db.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Create JWT token (new users are not admin by default)
        const token = jwt.sign({ userId: result.insertId, isAdmin: false }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            userId: result.insertId,
            isAdmin: false
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user by email
        const [user] = await db.pool.query(
            'SELECT id, password_hash, is_admin FROM users WHERE email = ?',
            [email]
        );

        if (!user.length) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isAdmin = Boolean(user[0].is_admin);

        // Create JWT token
        const token = jwt.sign({ userId: user[0].id, isAdmin }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h'
        });

        res.json({
            message: 'Login successful',
            token,
            userId: user[0].id,
            isAdmin
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
