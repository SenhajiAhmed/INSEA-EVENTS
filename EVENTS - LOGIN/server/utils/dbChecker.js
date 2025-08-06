const mysql = require('mysql2/promise');
require('dotenv').config();

// Initial connection config without database
const initialConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Seenhaji@2025',
    port: 3306
};

// Full config with database
const dbConfig = {
    ...initialConfig,
    database: 'events_auth'
};

async function checkAndCreateDatabase() {
    try {
        // First connect without specifying database
        const connection = await mysql.createConnection(initialConfig);
        
        // Create database if it doesn't exist
        await connection.query(`
            CREATE DATABASE IF NOT EXISTS ${dbConfig.database}
        `);

        // Select the database
        await connection.query(`USE ${dbConfig.database}`);

        // Create tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id INT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('Database and tables created successfully');
        
        // Close the initial connection
        await connection.end();

        // Now create the pool with the full config including database
        const pool = mysql.createPool(dbConfig);
        
        // Test the pool connection
        const [rows] = await pool.query('SELECT 1');
        console.log('Connected to database successfully');

        return pool;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

module.exports = checkAndCreateDatabase;
