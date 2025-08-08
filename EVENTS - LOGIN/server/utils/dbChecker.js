const mysql = require('mysql2/promise');

let pool;

// Hardcoded configuration to ensure connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Seenhaji@2025',
    database: process.env.DB_DATABASE || 'events_auth',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    // Remove collation as it's causing warnings
    // Add connection flags for proper binary data handling
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // Enable multi-statement queries for migrations
    multipleStatements: true
};

async function checkAndCreateDatabase() {
    if (pool) {
        return pool;
    }

    try {
        // Connect without specifying a database first to create it
        const initialConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await initialConnection.end();

        // Create the pool with the database specified
        pool = mysql.createPool(dbConfig);

        // Test the connection
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
        
        // Skip migrations for now since we manually updated the database
        console.log('Skipping automatic migrations (database already updated manually)');
        
        connection.release();

        return pool;

    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

async function runMigrations(connection) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        // Create migrations table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            // Check if migration has already been run
            const [existing] = await connection.query(
                'SELECT id FROM migrations WHERE filename = ?',
                [file]
            );

            if (existing.length === 0) {
                console.log(`Running migration: ${file}`);
                const migrationSQL = fs.readFileSync(
                    path.join(migrationsDir, file),
                    'utf8'
                );

                // Split by semicolon and execute each statement
                const statements = migrationSQL
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

                for (const statement of statements) {
                    if (statement.trim()) {
                        try {
                            await connection.query(statement);
                        } catch (statementError) {
                            // Log the error but continue with migration
                            console.log(`⚠️ Statement warning in ${file}:`, statementError.message);
                            
                            // Only fail on critical errors, not column existence errors
                            if (!statementError.message.includes("doesn't exist") && 
                                !statementError.message.includes("already exists") &&
                                !statementError.message.includes("Duplicate key name")) {
                                throw statementError;
                            }
                        }
                    }
                }

                // Mark migration as completed
                await connection.query(
                    'INSERT INTO migrations (filename) VALUES (?)',
                    [file]
                );
                console.log(`Migration ${file} completed successfully`);
            }
        }
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
}

module.exports = { 
    checkAndCreateDatabase, 
    get pool() {
        if (!pool) {
            throw new Error('Database pool not initialized. Call checkAndCreateDatabase first.');
        }
        return pool;
    }
};
