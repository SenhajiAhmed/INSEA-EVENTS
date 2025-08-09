-- Migration: Add event-specific fields to posts table
-- This migration adds fields for technical specs, quick info, and event program

-- Add technical_specs column for storing technical specifications
ALTER TABLE posts ADD COLUMN technical_specs TEXT NULL AFTER content;

-- Add quick_info column for storing quick information/overview
ALTER TABLE posts ADD COLUMN quick_info TEXT NULL AFTER technical_specs;

-- Add event_program column for storing the event program and schedule
ALTER TABLE posts ADD COLUMN event_program TEXT NULL AFTER quick_info;

-- Add indexes for better performance
CREATE INDEX idx_posts_technical_specs ON posts(technical_specs(100));
CREATE INDEX idx_posts_quick_info ON posts(quick_info(100));
CREATE INDEX idx_posts_event_program ON posts(event_program(100));

-- Update existing posts to have empty values for new columns
UPDATE posts SET 
    technical_specs = '',
    quick_info = '',
    event_program = ''
WHERE technical_specs IS NULL 
   OR quick_info IS NULL 
   OR event_program IS NULL; 