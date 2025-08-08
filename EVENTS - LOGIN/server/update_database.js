const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Seenhaji@2025',
    database: process.env.DB_DATABASE || 'events_auth',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    multipleStatements: true
};

async function updateDatabase() {
    let connection;
    
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully!');
        
        // Check current table structure
        console.log('\n=== CURRENT TABLE STRUCTURE ===');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts' 
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.table(columns);
        
        // Check if image column exists
        const imageColumnExists = columns.some(col => col.COLUMN_NAME === 'image');
        const imagePathColumnExists = columns.some(col => col.COLUMN_NAME === 'image_path');
        
        console.log(`\nImage column exists: ${imageColumnExists}`);
        console.log(`Image_path column exists: ${imagePathColumnExists}`);
        
        // Perform the migration
        console.log('\n=== PERFORMING MIGRATION ===');
        
        if (imageColumnExists) {
            console.log('Dropping image column...');
            await connection.query('ALTER TABLE posts DROP COLUMN image');
            console.log('✅ Image column dropped');
        }
        
        if (!imagePathColumnExists) {
            console.log('Adding image_path column...');
            await connection.query('ALTER TABLE posts ADD COLUMN image_path VARCHAR(500) NULL AFTER content');
            console.log('✅ Image_path column added');
        }
        
        // Add indexes
        console.log('Adding indexes...');
        try {
            await connection.query('CREATE INDEX IF NOT EXISTS idx_posts_image_path ON posts(image_path)');
            await connection.query('CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)');
            await connection.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)');
            console.log('✅ Indexes added');
        } catch (indexError) {
            console.log('⚠️ Some indexes may already exist:', indexError.message);
        }
        
        // Show final table structure
        console.log('\n=== FINAL TABLE STRUCTURE ===');
        const [finalColumns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts' 
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.table(finalColumns);
        
        console.log('\n🎉 Database migration completed successfully!');
        console.log('The posts table now uses image_path (VARCHAR) instead of image (LONGBLOB)');
        
    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the update
updateDatabase();
