-- Fix image column to properly handle binary data
-- This migration ensures the image column can store LONGBLOB data correctly

-- First, check if we need to modify the existing column
ALTER TABLE posts MODIFY COLUMN image LONGBLOB;

-- Ensure the table uses proper charset for text fields while keeping binary fields as binary
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Re-apply LONGBLOB to image column after charset conversion
ALTER TABLE posts MODIFY COLUMN image LONGBLOB;

-- Add an index on slug for better performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Add an index on created_at for better performance (if not already exists)  
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
