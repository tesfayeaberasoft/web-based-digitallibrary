-- ============================================================================
-- CRITICAL FIX FOR INFINITYFREE - Run this FIRST before anything else!
-- ============================================================================
-- This fixes the actual database structure issues seen on your server
-- Run this in phpMyAdmin for database: if0_43312804_digital_library
-- ============================================================================

-- FIX 1: Add missing columns to audit_logs table (one at a time to avoid duplicates)
-- Your current table is incomplete - it's missing critical columns!

-- Add new_values if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'new_values');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `audit_logs` ADD COLUMN `new_values` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `old_values`',
    'SELECT "Column new_values already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add ip_address if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'ip_address');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `audit_logs` ADD COLUMN `ip_address` VARCHAR(45) DEFAULT NULL AFTER `new_values`',
    'SELECT "Column ip_address already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add user_agent if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'user_agent');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `audit_logs` ADD COLUMN `user_agent` TEXT DEFAULT NULL AFTER `ip_address`',
    'SELECT "Column user_agent already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_at if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE `audit_logs` ADD COLUMN `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER `user_agent`',
    'SELECT "Column created_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the fix worked:
SHOW COLUMNS FROM `audit_logs`;
-- You should now see: id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at

-- ============================================================================
-- FIX 2: Add missing columns to book_loans (if they don't exist)
-- ============================================================================

ALTER TABLE `book_loans`
ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================================
-- FIX 3: Add missing columns to book_reviews
-- ============================================================================

ALTER TABLE `book_reviews`
ADD COLUMN IF NOT EXISTS `review_text` TEXT DEFAULT NULL AFTER `rating`,
ADD COLUMN IF NOT EXISTS `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' AFTER `review_text`,
ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`,
ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- ============================================================================
-- FIX 4: Ensure proper indexes exist for performance
-- ============================================================================

-- Books table indexes
CREATE INDEX IF NOT EXISTS `idx_books_isbn` ON `books` (`isbn`);
CREATE INDEX IF NOT EXISTS `idx_books_status` ON `books` (`status`);
CREATE INDEX IF NOT EXISTS `idx_books_category` ON `books` (`category_id`);

-- Book loans indexes
CREATE INDEX IF NOT EXISTS `idx_loans_user` ON `book_loans` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_loans_book` ON `book_loans` (`book_id`);
CREATE INDEX IF NOT EXISTS `idx_loans_status` ON `book_loans` (`status`);
CREATE INDEX IF NOT EXISTS `idx_loans_due_date` ON `book_loans` (`due_date`);
CREATE INDEX IF NOT EXISTS `idx_loans_return_date` ON `book_loans` (`return_date`);

-- ============================================================================
-- VERIFICATION QUERIES - Run these to confirm everything worked
-- ============================================================================

-- 1. Check audit_logs structure
SELECT 'audit_logs structure:' as info;
SHOW COLUMNS FROM `audit_logs`;

-- 2. Check book_loans structure  
SELECT 'book_loans structure:' as info;
SHOW COLUMNS FROM `book_loans`;

-- 3. Check current data counts
SELECT 'Data counts:' as info;
SELECT 'Books' as table_name, COUNT(*) as count FROM `books`
UNION ALL SELECT 'Book Loans', COUNT(*) FROM `book_loans`
UNION ALL SELECT 'Users', COUNT(*) FROM `users`
UNION ALL SELECT 'Audit Logs', COUNT(*) FROM `audit_logs`;

-- 4. Check active loans (should show borrowed books)
SELECT 'Active loans:' as info;
SELECT 
    bl.id,
    bl.user_id,
    u.full_name,
    b.title,
    bl.loan_date,
    bl.due_date,
    bl.status
FROM book_loans bl
INNER JOIN users u ON bl.user_id = u.id
INNER JOIN books b ON bl.book_id = b.id
WHERE bl.status IN ('active', 'renewed')
AND bl.return_date IS NULL
ORDER BY bl.loan_date DESC;

-- ============================================================================
-- DONE! After running this:
-- 1. Upload the updated backend files
-- 2. Upload the updated frontend build
-- 3. Clear browser cache completely
-- 4. Test all functionality
-- ============================================================================
