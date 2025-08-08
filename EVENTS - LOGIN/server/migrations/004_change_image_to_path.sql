-- Change image storage from binary to file path
-- This migration switches from LONGBLOB to VARCHAR for storing image file paths

-- Drop the problematic binary image column
ALTER TABLE posts DROP COLUMN image;

-- Add new image_path column for storing file paths
ALTER TABLE posts ADD COLUMN image_path VARCHAR(500) NULL AFTER content;

-- Add index for better performance when querying by image presence
CREATE INDEX idx_posts_image_path ON posts(image_path);
