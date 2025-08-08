-- Force fix for image column binary storage issue
-- This migration directly addresses the MySQL charset/binary data conflict

-- Drop the image column and recreate it with explicit binary specification
ALTER TABLE posts DROP COLUMN image;

-- Add the image column back with explicit LONGBLOB and binary specification
ALTER TABLE posts ADD COLUMN image LONGBLOB NULL AFTER content;

-- Ensure the table charset is correct for text fields while preserving binary fields
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Re-specify the image column as LONGBLOB to ensure it remains binary after charset conversion
ALTER TABLE posts MODIFY COLUMN image LONGBLOB NULL;
