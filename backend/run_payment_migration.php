<?php
/**
 * Payment Migration Script
 * Run this file once to create the Chapa payment integration tables
 *
 * Usage: php run_payment_migration.php
 */

require_once __DIR__ . '/config/database.php';

// ── Individual DDL statements (avoids DELIMITER $$ issues with PDO) ───────────

$statements = [

    // 1. payments table
    "CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tx_ref VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique transaction reference for Chapa',
        user_id INT NOT NULL,
        fine_id INT NOT NULL COMMENT 'Reference to the fine being paid',
        amount DECIMAL(10,2) NOT NULL COMMENT 'Payment amount',
        currency VARCHAR(3) DEFAULT 'ETB' COMMENT 'Currency code',
        status ENUM('pending','success','failed','cancelled') DEFAULT 'pending',
        chapa_reference VARCHAR(100) NULL COMMENT 'Chapa internal reference',
        checkout_url TEXT NULL COMMENT 'Chapa checkout URL',
        verified_at DATETIME NULL COMMENT 'When payment was verified',
        chapa_response JSON NULL COMMENT 'Full Chapa API response for audit',
        customer_email VARCHAR(255) NULL,
        customer_phone VARCHAR(20) NULL,
        customer_name VARCHAR(255) NULL,
        payment_method VARCHAR(50) NULL COMMENT 'telebirr, cbebirr, ebirr, etc.',
        callback_attempts INT DEFAULT 0 COMMENT 'Number of callback verification attempts',
        last_callback_at DATETIME NULL COMMENT 'Last callback timestamp',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_fine_id (fine_id),
        INDEX idx_tx_ref (tx_ref),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 2. payment_logs table
    "CREATE TABLE IF NOT EXISTS payment_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        payment_id INT NOT NULL,
        tx_ref VARCHAR(100) NOT NULL,
        event_type ENUM('initialization','callback','verification','status_change','error') NOT NULL,
        status_before VARCHAR(50) NULL,
        status_after VARCHAR(50) NULL,
        request_data JSON NULL COMMENT 'API request payload',
        response_data JSON NULL COMMENT 'API response payload',
        error_message TEXT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
        INDEX idx_payment_id (payment_id),
        INDEX idx_tx_ref (tx_ref),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 3. payment_settings table
    "CREATE TABLE IF NOT EXISTS payment_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 4. Seed default payment settings
    "INSERT INTO payment_settings (setting_key, setting_value, description) VALUES
        ('chapa_enabled',       'true',                                         'Enable/disable Chapa payment gateway'),
        ('chapa_test_mode',     'true',                                         'Use test API keys (sandbox mode)'),
        ('chapa_currency',      'ETB',                                          'Default currency for transactions'),
        ('fine_per_day',        '5.00',                                         'Fine amount per day overdue'),
        ('payment_callback_url','http://localhost:8000/api/payments/callback',  'Chapa callback URL'),
        ('payment_return_url',  'http://localhost:3000/dashboard',              'User return URL after payment')
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP",
];

// ── ALTER TABLE fines — each column added separately so one failure doesn't block others ──

$finesAlters = [
    "ALTER TABLE fines ADD COLUMN payment_status ENUM('unpaid','paid','partial') DEFAULT 'unpaid' AFTER amount",
    "ALTER TABLE fines ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0.00 AFTER payment_status",
    "ALTER TABLE fines ADD COLUMN paid_at DATETIME NULL AFTER paid_amount",
    "ALTER TABLE fines ADD COLUMN payment_id INT NULL COMMENT 'Reference to successful payment' AFTER paid_at",
    "ALTER TABLE fines ADD FOREIGN KEY fk_fines_payment (payment_id) REFERENCES payments(id) ON DELETE SET NULL",
    "ALTER TABLE fines ADD INDEX idx_payment_status (payment_status)",
];

// ── Run migration ─────────────────────────────────────────────────────────────

try {
    echo "=================================================================\n";
    echo "CHAPA PAYMENT GATEWAY - DATABASE MIGRATION\n";
    echo "=================================================================\n\n";

    $conn = Database::getInstance()->getConnection();
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }
    echo "Connected to database successfully.\n\n";
    echo "Executing migration...\n";
    echo "-----------------------------------------------------------------\n";

    $successCount = 0;
    $errorCount   = 0;

    foreach ($statements as $sql) {
        try {
            $conn->exec($sql);
            $successCount++;
            if (stripos($sql, 'CREATE TABLE') !== false) {
                preg_match('/CREATE TABLE IF NOT EXISTS\s+(\w+)/i', $sql, $m);
                echo "✓ Created table: " . ($m[1] ?? '?') . "\n";
            } elseif (stripos($sql, 'INSERT INTO payment_settings') !== false) {
                echo "✓ Seeded payment_settings\n";
            }
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') === false &&
                strpos($e->getMessage(), 'Duplicate')      === false) {
                echo "✗ Error: " . $e->getMessage() . "\n";
                $errorCount++;
            } else {
                echo "- Skipped (already exists)\n";
            }
        }
    }

    // Alter fines table — ignore "duplicate column" errors
    foreach ($finesAlters as $sql) {
        try {
            $conn->exec($sql);
            $successCount++;
            preg_match('/ADD COLUMN\s+(\w+)|ADD (FOREIGN KEY|INDEX)\s+(\w+)/i', $sql, $m);
            $what = $m[1] ?? $m[2] ?? 'constraint';
            echo "✓ fines: added $what\n";
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            // Ignore "already exists" / "Duplicate column name" / "Duplicate key name"
            if (strpos($msg, 'already exists') !== false ||
                strpos($msg, 'Duplicate column') !== false ||
                strpos($msg, 'Duplicate key') !== false ||
                strpos($msg, 'Duplicate foreign') !== false) {
                echo "- fines alter skipped (already applied)\n";
            } else {
                echo "✗ fines alter error: $msg\n";
                $errorCount++;
            }
        }
    }

    echo "-----------------------------------------------------------------\n\n";
    echo "Successful operations : $successCount\n";
    echo "Errors                : $errorCount\n\n";

    // ── Verify ────────────────────────────────────────────────────────────────
    echo "Verifying tables...\n";
    $allOk = true;
    foreach (['payments', 'payment_logs', 'payment_settings'] as $table) {
        $stmt = $conn->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->rowCount() > 0;
        if ($exists) {
            $cnt = $conn->query("SELECT COUNT(*) as c FROM $table")->fetch()['c'];
            echo "✓ $table  (rows: $cnt)\n";
        } else {
            echo "✗ $table  NOT FOUND\n";
            $allOk = false;
        }
    }

    echo "\n";
    if ($allOk) {
        echo "=================================================================\n";
        echo "MIGRATION SUCCESSFUL! You can now use Chapa payment gateway.\n";
        echo "=================================================================\n";
    } else {
        echo "⚠ Some tables are missing — review the errors above.\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "\n❌ MIGRATION FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
