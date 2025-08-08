-- Final migration: Convert image storage from LONGBLOB to file path
-- This migration safely handles the transition regardless of current column state

-- Check if image column exists and drop it if present
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'posts' 
    AND COLUMN_NAME = 'image'
);

SET @sql = IF(@column_exists > 0, 'ALTER TABLE posts DROP COLUMN image;', 'SELECT "image column does not exist";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if image_path column exists, if not create it
SET @path_column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'posts' 
    AND COLUMN_NAME = 'image_path'
);

SET @sql = IF(@path_column_exists = 0, 'ALTER TABLE posts ADD COLUMN image_path VARCHAR(500) NULL AFTER content;', 'SELECT "image_path column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_posts_image_path ON posts(image_path);

-- Ensure other useful indexes exist
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
