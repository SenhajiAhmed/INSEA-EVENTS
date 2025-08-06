require('dotenv').config();

const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Seenhaji@2025',
    database: 'events_auth',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Export pool and config
module.exports = {
    pool,
    dbConfig
};
