-- Migration: Add condition_status column to books table
-- Date: 2024
-- Description: Adds condition_status field to track book condition (new, good, fair, poor, damaged)

-- Check if the column already exists and add it if not
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS condition_status ENUM('new', 'good', 'fair', 'poor', 'damaged') 
DEFAULT 'good' 
AFTER status;

-- Update existing books to have 'good' condition if NULL
UPDATE books SET condition_status = 'good' WHERE condition_status IS NULL;

-- Add comment to the column
ALTER TABLE books 
MODIFY COLUMN condition_status ENUM('new', 'good', 'fair', 'poor', 'damaged') 
DEFAULT 'good' 
COMMENT 'Physical condition of the book';
