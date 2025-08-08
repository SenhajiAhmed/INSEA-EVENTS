const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Seenhaji@2025',
    database: 'events_auth',
    port: 3306,
    multipleStatements: true
};

async function runMigration() {
    let connection;
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', '001_add_slug_to_posts.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        // Connect to the database
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server');
        
        // Run the migration
        console.log('Running migration...');
        await connection.query(migrationSQL);
        
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the migration
runMigration();
