<?php
/**
 * Normalize and deduplicate system_settings rows.
 * Run: php backend/scripts/cleanup-system-settings.php
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/settings-helper.php';

$db = Database::getInstance()->getConnection();

echo "=== system_settings cleanup ===\n\n";

$deleted = 0;
foreach (DEPRECATED_SETTING_KEYS as [$cat, $key]) {
    $stmt = $db->prepare('DELETE FROM system_settings WHERE category = ? AND setting_key = ?');
    $stmt->execute([$cat, $key]);
    $n = $stmt->rowCount();
    if ($n > 0) {
        echo "Deleted duplicate/obsolete: {$cat}.{$key}\n";
        $deleted += $n;
    }
}

// Merge max_renewal_count into renewalLimit before delete (if renewalLimit missing)
$stmt = $db->prepare("SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='renewalLimit'");
$stmt->execute();
$renewal = $stmt->fetchColumn();
if ($renewal === false) {
    $stmt = $db->prepare("SELECT setting_value FROM system_settings WHERE category='system' AND setting_key='max_renewal_count'");
    $stmt->execute();
    $legacy = $stmt->fetchColumn();
    if ($legacy !== false) {
        $ins = $db->prepare("
            INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
            VALUES ('system', 'renewalLimit', ?, 'Maximum renewals per loan', NOW())
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");
        $ins->execute([$legacy]);
        echo "Migrated system.max_renewal_count -> renewalLimit\n";
    }
}

// Ensure library_policies has required keys (from current system/library duplicates if any)
$policyDefaults = [
    'max_user_borrow_books' => 5,
    'due_fines_per_day' => 0.5,
    'max_book_return_days' => 14,
    'max_reservations_per_user' => 3,
    'grace_period_days' => 3,
    'renewal_limit' => 2,
    'reservation_hold_days' => 7,
];

foreach ($policyDefaults as $key => $default) {
    $stmt = $db->prepare("SELECT id, setting_value FROM system_settings WHERE category='library_policies' AND setting_key=?");
    $stmt->execute([$key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        // Try legacy sources
        $fallback = null;
        if ($key === 'max_user_borrow_books') {
            $fallback = getRowValue($db, 'system', 'maxBooksPerUser');
        } elseif ($key === 'due_fines_per_day') {
            $fallback = getRowValue($db, 'system', 'finePerDay');
        } elseif ($key === 'max_book_return_days') {
            $fallback = getRowValue($db, 'system', 'maxBorrowDays');
        } elseif ($key === 'max_reservations_per_user') {
            $fallback = getRowValue($db, 'system', 'maxReservationsPerUser');
        } elseif ($key === 'renewal_limit') {
            $fallback = getRowValue($db, 'system', 'renewalLimit');
        } elseif ($key === 'reservation_hold_days') {
            $fallback = getRowValue($db, 'system', 'reservationHoldDays');
        }
        $val = $fallback !== null ? $fallback : $default;
        insertSetting($db, 'library_policies', $key, $val, 'Library policy');
        echo "Added library_policies.{$key} = {$val}\n";
    }
}

// Canonical library row: prefer libraryName over library_name
$stmt = $db->query("SELECT setting_key, setting_value FROM system_settings WHERE category='library'");
$lib = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $lib[$row['setting_key']] = $row['setting_value'];
}
if (!empty($lib['libraryName']) || !empty($lib['library_name'])) {
    $name = $lib['libraryName'] ?? $lib['library_name'];
    insertSetting($db, 'library', 'libraryName', $name, 'Library display name');
}

// Remove non-canonical library keys (keep only UI keys)
$stmt = $db->query("SELECT setting_key FROM system_settings WHERE category='library'");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (!in_array($row['setting_key'], LIBRARY_UI_KEYS, true)) {
        $del = $db->prepare("DELETE FROM system_settings WHERE category='library' AND setting_key=?");
        $del->execute([$row['setting_key']]);
        echo "Removed non-UI library key: {$row['setting_key']}\n";
        $deleted++;
    }
}

// Map reservation_expiry_days -> reservation_hold_days if only expiry exists
$exp = getRowValue($db, 'library_policies', 'reservation_expiry_days');
if ($exp !== null && getRowValue($db, 'library_policies', 'reservation_hold_days') === null) {
    insertSetting($db, 'library_policies', 'reservation_hold_days', $exp, 'Days to hold a reservation');
    echo "Migrated reservation_expiry_days -> reservation_hold_days\n";
}

// Prevent future duplicate rows per category+key
try {
    $db->exec('ALTER TABLE system_settings ADD UNIQUE KEY unique_setting (category, setting_key)');
    echo "Added UNIQUE(category, setting_key) constraint.\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
        echo "Unique constraint already exists.\n";
    } else {
        echo "Note: could not add unique index (remove any remaining duplicates first): {$e->getMessage()}\n";
    }
}

echo "\nDeleted {$deleted} obsolete row(s).\n";
echo "Done. Remaining rows:\n";
$stmt = $db->query('SELECT id, category, setting_key, LEFT(setting_value, 40) AS val FROM system_settings ORDER BY category, setting_key');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  [{$r['id']}] {$r['category']}.{$r['setting_key']} = {$r['val']}...\n";
}

function getRowValue($db, $category, $key) {
    $stmt = $db->prepare('SELECT setting_value FROM system_settings WHERE category=? AND setting_key=?');
    $stmt->execute([$category, $key]);
    $v = $stmt->fetchColumn();
    return $v === false ? null : $v;
}

function insertSetting($db, $category, $key, $value, $description = null) {
    if (is_array($value) || is_object($value)) {
        $value = json_encode($value);
    }
    $stmt = $db->prepare("
        INSERT INTO system_settings (category, setting_key, setting_value, description, updated_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value),
            description = COALESCE(VALUES(description), description),
            updated_at = NOW()
    ");
    $stmt->execute([$category, $key, (string) $value, $description]);
}
