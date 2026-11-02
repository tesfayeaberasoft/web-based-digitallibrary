-- ============================================================================
-- SIMPLE FIX - Run this if columns already exist
-- ============================================================================
-- Just verify your table structure is correct
-- ============================================================================

-- Check what columns you currently have
SHOW COLUMNS FROM `audit_logs`;

-- You should see these 10 columns:
-- 1. id
-- 2. user_id
-- 3. action
-- 4. table_name
-- 5. record_id
-- 6. old_values
-- 7. new_values (if missing, see below)
-- 8. ip_address (if missing, see below)
-- 9. user_agent (if missing, see below)
-- 10. created_at (if missing, see below)

-- ============================================================================
-- If you see ALL 10 columns above, YOU'RE DONE with database fix!
-- Skip to uploading files.
-- ============================================================================

-- ============================================================================
-- If ONLY these columns are missing, add them individually:
-- ============================================================================

-- If new_values is missing (run this):
-- ALTER TABLE `audit_logs` ADD COLUMN `new_values` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `old_values`;

-- If ip_address is missing (run this):
-- ALTER TABLE `audit_logs` ADD COLUMN `ip_address` VARCHAR(45) DEFAULT NULL AFTER `new_values`;

-- If user_agent is missing (run this):
-- ALTER TABLE `audit_logs` ADD COLUMN `user_agent` TEXT DEFAULT NULL AFTER `ip_address`;

-- If created_at is missing (run this):
-- ALTER TABLE `audit_logs` ADD COLUMN `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER `user_agent`;

-- ============================================================================
-- After adding any missing columns, verify again:
-- ============================================================================

SHOW COLUMNS FROM `audit_logs`;

-- Should show 10 columns!

-- ============================================================================
-- Once you see all 10 columns, the database is fixed!
-- Now upload the backend and frontend files.
-- ============================================================================
