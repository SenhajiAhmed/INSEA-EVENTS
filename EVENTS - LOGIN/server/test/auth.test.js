const request = require('supertest');
const app = require('../index');
const bcrypt = require('bcryptjs');
const db = require('../config/db.config');

// Test user data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
};

// Test suite for authentication endpoints
describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Create test user
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        await db.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [testUser.username, testUser.email, hashedPassword]
        );
    });

    afterAll(async () => {
        // Clean up test data
        await db.pool.query('DELETE FROM users WHERE email = ?', [testUser.email]);
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('userId');
        });

        it('should return error for duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser2',
                    email: testUser.email,
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('userId');
        });

        it('should return error for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });
});
