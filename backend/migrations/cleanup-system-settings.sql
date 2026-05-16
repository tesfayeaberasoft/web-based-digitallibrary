-- One-time cleanup for duplicate system_settings rows (run in phpMyAdmin or mysql CLI).
-- Safe to run after backing up the table.

-- Remove duplicate / obsolete keys
DELETE FROM system_settings WHERE category = 'library' AND setting_key = 'library_name';
DELETE FROM system_settings WHERE category = 'system' AND setting_key IN ('maxBorrowDays', 'finePerDay', 'maxBooksPerUser', 'max_renewal_count');
DELETE FROM system_settings WHERE category = 'library_policies' AND setting_key = 'reservation_expiry_days';

-- Ensure loan policy keys exist (adjust values to match your library before running)
INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
SELECT 'library_policies', 'max_reservations_per_user', COALESCE(
  (SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='maxReservationsPerUser' LIMIT 1), '3'
), 'Max active reservations per user', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category='library_policies' AND setting_key='max_reservations_per_user');

INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
SELECT 'library_policies', 'grace_period_days', COALESCE(
  (SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='gracePeriodDays' LIMIT 1), '3'
), 'Grace days before fines apply', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category='library_policies' AND setting_key='grace_period_days');

INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
SELECT 'library_policies', 'renewal_limit', COALESCE(
  (SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='renewalLimit' LIMIT 1), '2'
), 'Maximum renewals per loan', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category='library_policies' AND setting_key='renewal_limit');

INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
SELECT 'library_policies', 'reservation_hold_days', COALESCE(
  (SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='reservationHoldDays' LIMIT 1), '7'
), 'Days to hold a picked-up reservation', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category='library_policies' AND setting_key='reservation_hold_days');

-- Prevent duplicate rows going forward (skip if index already exists)
ALTER TABLE system_settings ADD UNIQUE KEY unique_setting (category, setting_key);
