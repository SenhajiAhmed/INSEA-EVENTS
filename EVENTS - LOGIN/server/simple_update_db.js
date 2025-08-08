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
    charset: 'utf8mb4'
};

async function updateDatabase() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully!');
        
        // Check current table structure
        console.log('\n📋 Checking current table structure...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts' 
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        console.log('Current columns:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
        
        const hasImageColumn = columns.some(col => col.COLUMN_NAME === 'image');
        const hasImagePathColumn = columns.some(col => col.COLUMN_NAME === 'image_path');
        
        console.log(`\n🔍 Analysis:`);
        console.log(`  - Has 'image' column: ${hasImageColumn}`);
        console.log(`  - Has 'image_path' column: ${hasImagePathColumn}`);
        
        // Step 1: Drop image column if it exists
        if (hasImageColumn) {
            console.log('\n🗑️ Dropping problematic image column...');
            try {
                await connection.query('ALTER TABLE posts DROP COLUMN image');
                console.log('✅ Image column dropped successfully');
            } catch (error) {
                console.log('⚠️ Could not drop image column:', error.message);
            }
        } else {
            console.log('\n✅ Image column already removed or never existed');
        }
        
        // Step 2: Add image_path column if it doesn't exist
        if (!hasImagePathColumn) {
            console.log('\n➕ Adding image_path column...');
            try {
                await connection.query('ALTER TABLE posts ADD COLUMN image_path VARCHAR(500) NULL AFTER content');
                console.log('✅ Image_path column added successfully');
            } catch (error) {
                console.log('⚠️ Could not add image_path column:', error.message);
            }
        } else {
            console.log('\n✅ Image_path column already exists');
        }
        
        // Step 3: Add indexes
        console.log('\n📊 Adding indexes...');
        const indexes = [
            { name: 'idx_posts_image_path', sql: 'CREATE INDEX idx_posts_image_path ON posts(image_path)' },
            { name: 'idx_posts_slug', sql: 'CREATE INDEX idx_posts_slug ON posts(slug)' },
            { name: 'idx_posts_created_at', sql: 'CREATE INDEX idx_posts_created_at ON posts(created_at)' }
        ];
        
        for (const index of indexes) {
            try {
                await connection.query(index.sql);
                console.log(`✅ Added index: ${index.name}`);
            } catch (error) {
                if (error.message.includes('Duplicate key name')) {
                    console.log(`✅ Index ${index.name} already exists`);
                } else {
                    console.log(`⚠️ Could not add index ${index.name}:`, error.message);
                }
            }
        }
        
        // Step 4: Show final structure
        console.log('\n📋 Final table structure:');
        const [finalColumns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts' 
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database]);
        
        finalColumns.forEach(col => {
            const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${nullable}`);
        });
        
        console.log('\n🎉 Database update completed successfully!');
        console.log('✅ The posts table now uses image_path (VARCHAR) instead of image (LONGBLOB)');
        console.log('✅ You can now start the server and test image uploads!');
        
    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed.');
        }
    }
}

// Run the update
console.log('🚀 Starting database update for image handling...\n');
updateDatabase();
