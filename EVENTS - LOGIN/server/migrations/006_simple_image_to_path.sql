-- Simple migration: Convert image storage from LONGBLOB to file path
-- Direct SQL commands without prepared statements

-- Drop the image column (ignore error if it doesn't exist)
ALTER TABLE posts DROP COLUMN image;

-- Add the image_path column 
ALTER TABLE posts ADD COLUMN image_path VARCHAR(500) NULL AFTER content;

-- Add useful indexes
CREATE INDEX idx_posts_image_path ON posts(image_path);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_created_at ON posts(created_at);
