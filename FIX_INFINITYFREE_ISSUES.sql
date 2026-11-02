-- SQL FIX for InfinityFree Database Issues
-- Run this in phpMyAdmin for your InfinityFree database

-- ============================================
-- FIX 1: Add missing columns to audit_logs
-- ============================================

-- Check if columns exist and add if missing
ALTER TABLE `audit_logs` 
ADD COLUMN IF NOT EXISTS `new_values` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
ADD COLUMN IF NOT EXISTS `ip_address` varchar(45) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `user_agent` text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `created_at` timestamp NULL DEFAULT current_timestamp();

-- ============================================
-- FIX 2: Ensure books table has correct columns
-- ============================================

-- Add created_at and updated_at if missing
ALTER TABLE `books`
ADD COLUMN IF NOT EXISTS `created_at` timestamp NULL DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- ============================================
-- FIX 3: Ensure book_loans has all required columns
-- ============================================

ALTER TABLE `book_loans`
ADD COLUMN IF NOT EXISTS `renewal_count` int(11) DEFAULT 0,
ADD COLUMN IF NOT EXISTS `created_at` timestamp NULL DEFAULT current_timestamp();

-- ============================================
-- FIX 4: Update character set to utf8mb4 for compatibility
-- ============================================

-- Only run if you're experiencing character encoding issues
-- Backup your database first!

-- ALTER TABLE `books` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE `book_loans` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE `audit_logs` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- FIX 5: Verify indexes exist for performance
-- ============================================

-- Add indexes if missing (ignore errors if they already exist)

-- Books indexes
ALTER TABLE `books` ADD INDEX IF NOT EXISTS `idx_isbn` (`isbn`);
ALTER TABLE `books` ADD INDEX IF NOT EXISTS `idx_title` (`title`(255));
ALTER TABLE `books` ADD INDEX IF NOT EXISTS `idx_status` (`status`);
ALTER TABLE `books` ADD INDEX IF NOT EXISTS `idx_category` (`category_id`);

-- Book loans indexes
ALTER TABLE `book_loans` ADD INDEX IF NOT EXISTS `idx_user_id` (`user_id`);
ALTER TABLE `book_loans` ADD INDEX IF NOT EXISTS `idx_book_id` (`book_id`);
ALTER TABLE `book_loans` ADD INDEX IF NOT EXISTS `idx_status` (`status`);
ALTER TABLE `book_loans` ADD INDEX IF NOT EXISTS `idx_due_date` (`due_date`);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the fixes worked:

-- Check audit_logs structure
SHOW COLUMNS FROM `audit_logs`;

-- Check books structure
SHOW COLUMNS FROM `books`;

-- Check book_loans structure
SHOW COLUMNS FROM `book_loans`;

-- Count records to ensure data is intact
SELECT 'Books' as table_name, COUNT(*) as count FROM `books`
UNION ALL
SELECT 'Book Loans', COUNT(*) FROM `book_loans`
UNION ALL
SELECT 'Users', COUNT(*) FROM `users`
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM `audit_logs`;

-- ============================================
-- DONE!
-- ============================================
-- After running this SQL:
-- 1. Upload the new backend PHP files
-- 2. Upload the new frontend build
-- 3. Clear browser cache
-- 4. Test all functionality
