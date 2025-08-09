const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Seenhaji@2025',
  database: 'events_auth'
};

// Helpers to make migration idempotent
async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(conn, table, indexName) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
    [table, indexName]
  );
  return rows.length > 0;
}

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations', '007_add_event_details.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration...');
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (let raw of statements) {
      const statement = raw.trim();
      if (!statement) continue;

      // Detect ALTER TABLE ... ADD COLUMN statements for posts
      const addColMatch = statement.match(/ALTER\s+TABLE\s+posts\s+ADD\s+COLUMN\s+`?([a-zA-Z0-9_]+)`?/i);
      if (addColMatch) {
        const col = addColMatch[1];
        if (await columnExists(connection, 'posts', col)) {
          console.log(`Column '${col}' already exists, skipping.`);
          continue;
        }
      }

      // Detect CREATE INDEX statements on posts
      const createIdxMatch = statement.match(/CREATE\s+INDEX\s+`?([a-zA-Z0-9_]+)`?\s+ON\s+posts/i);
      if (createIdxMatch) {
        const idx = createIdxMatch[1];
        if (await indexExists(connection, 'posts', idx)) {
          console.log(`Index '${idx}' already exists, skipping.`);
          continue;
        }
      }

      try {
        await connection.execute(statement);
        console.log('Executed:', statement.substring(0, 60).replace(/\s+/g, ' ') + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('Index already exists (caught), skipping.');
          continue;
        }
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists (caught), skipping.');
          continue;
        }
        throw error;
      }
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the new columns exist
    console.log('\nVerifying new columns...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM posts');
    const newColumns = columns.filter(col => 
      ['technical_specs', 'quick_info', 'event_program'].includes(col.Field)
    );
    console.log('New columns found:', newColumns.map(col => col.Field));

    // Optional normalization: turn empty strings into NULL for these columns
    await connection.execute("UPDATE posts SET technical_specs = NULL WHERE technical_specs = ''");
    await connection.execute("UPDATE posts SET quick_info = NULL WHERE quick_info = ''");
    await connection.execute("UPDATE posts SET event_program = NULL WHERE event_program = ''");
    console.log('Normalized empty strings to NULL for new columns.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();