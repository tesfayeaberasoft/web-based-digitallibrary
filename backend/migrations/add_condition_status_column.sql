-- Run once on existing installations where books.condition_status is missing.
ALTER TABLE books
ADD COLUMN condition_status ENUM('new', 'good', 'fair', 'poor', 'damaged')
NOT NULL DEFAULT 'good' AFTER status;
