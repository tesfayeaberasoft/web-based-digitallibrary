<?php
/**
 * Settings System Migration Script
 * Ensures the complete settings system is properly installed and configured
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

echo "=== Digital Library Settings System Migration ===\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Starting migration process...\n\n";
    
    // Step 1: Create settings tables
    echo "1. Creating settings system tables...\n";
    createSettingsTables($db);
    
    // Step 2: Insert default settings
    echo "\n2. Inserting default settings...\n";
    insertDefaultSettings($db);
    
    // Step 3: Verify existing data compatibility
    echo "\n3. Verifying data compatibility...\n";
    verifyDataCompatibility($db);
    
    // Step 4: Update existing APIs
    echo "\n4. Checking API compatibility...\n";
    checkAPICompatibility();
    
    // Step 5: Create indexes for performance
    echo "\n5. Creating performance indexes...\n";
    createPerformanceIndexes($db);
    
    // Step 6: Set up maintenance scheduler
    echo "\n6. Setting up maintenance tasks...\n";
    setupMaintenanceTasks($db);
    
    echo "\n=== Migration Completed Successfully! ===\n";
    echo "The settings system is now fully integrated and ready to use.\n\n";
    
    // Display summary
    displayMigrationSummary($db);
    
} catch (Exception $e) {
    echo "MIGRATION FAILED: " . $e->getMessage() . "\n";
    echo "Please check the error and try again.\n";
    exit(1);
}

function createSettingsTables($db) {
    $sql = file_get_contents(__DIR__ . '/create_settings_tables.sql');
    
    if (!$sql) {
        throw new Exception("Could not read settings SQL file");
    }
    
    // Split SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            try {
                $db->exec($statement);
                if (preg_match('/CREATE TABLE.*?`(\w+)`/i', $statement, $matches)) {
                    echo "  ✓ Created table: {$matches[1]}\n";
                }
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'already exists') !== false) {
                    if (preg_match('/CREATE TABLE.*?`(\w+)`/i', $statement, $matches)) {
                        echo "  - Table already exists: {$matches[1]}\n";
                    }
                } else {
                    throw $e;
                }
            }
        }
    }
}

function insertDefaultSettings($db) {
    // Check if settings already exist
    $stmt = $db->query("SELECT COUNT(*) as count FROM system_settings");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "  - Default settings already exist ({$result['count']} settings)\n";
        return;
    }
    
    // Insert default settings
    $defaultSettings = [
        // Library Information
        ['library_info', 'library_name', 'Digital Library Management System', 'string', 'Name of the library'],
        ['library_info', 'description', 'A comprehensive digital library management solution', 'string', 'Library description'],
        ['library_info', 'address', '123 Library Street, Education City', 'string', 'Library physical address'],
        ['library_info', 'phone', '+1 (555) 123-4567', 'string', 'Library contact phone'],
        ['library_info', 'email', 'info@digitallibrary.com', 'string', 'Library contact email'],
        ['library_info', 'website', 'https://digitallibrary.com', 'string', 'Library website URL'],
        
        // Library Policies
        ['library_policies', 'max_user_borrow_books', '5', 'number', 'Maximum books a user can borrow simultaneously'],
        ['library_policies', 'due_fines_per_day', '0.50', 'number', 'Daily fine amount for overdue books (USD)'],
        ['library_policies', 'max_book_return_days', '14', 'number', 'Maximum days allowed for book return'],
        ['library_policies', 'max_reservations_per_user', '3', 'number', 'Maximum reservations per user'],
        ['library_policies', 'renewal_limit', '2', 'number', 'Maximum number of renewals allowed'],
        ['library_policies', 'grace_period_days', '3', 'number', 'Grace period before fines start'],
        
        // System Configuration
        ['system_config', 'allow_registration', 'true', 'boolean', 'Allow new user registration'],
        ['system_config', 'require_email_verification', 'true', 'boolean', 'Require email verification for new users'],
        ['system_config', 'session_timeout', '60', 'number', 'Session timeout in minutes'],
        ['system_config', 'password_min_length', '6', 'number', 'Minimum password length'],
        ['system_config', 'maintenance_mode', 'false', 'boolean', 'System maintenance mode'],
        
        // Notifications
        ['notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications'],
        ['notifications', 'overdue_reminders', 'true', 'boolean', 'Send overdue book reminders'],
        ['notifications', 'reservation_alerts', 'true', 'boolean', 'Send reservation alerts'],
        
        // Security
        ['security', 'login_attempts', '5', 'number', 'Maximum login attempts before lockout'],
        ['security', 'lockout_duration', '30', 'number', 'Account lockout duration in minutes'],
        ['security', 'audit_logging', 'true', 'boolean', 'Enable audit logging'],
        
        // Appearance
        ['appearance', 'theme', 'light', 'string', 'System theme (light/dark/auto)'],
        ['appearance', 'primary_color', '#4a9b8e', 'string', 'Primary theme color'],
        ['appearance', 'show_branding', 'true', 'boolean', 'Show library branding']
    ];
    
    $stmt = $db->prepare("
        INSERT INTO system_settings (category, setting_key, setting_value, data_type, description) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $inserted = 0;
    foreach ($defaultSettings as $setting) {
        try {
            $stmt->execute($setting);
            $inserted++;
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                throw $e;
            }
        }
    }
    
    echo "  ✓ Inserted {$inserted} default settings\n";
}

function verifyDataCompatibility($db) {
    // Check if existing tables have the required columns
    $requiredTables = [
        'users' => ['id', 'full_name', 'email', 'role', 'status'],
        'books' => ['id', 'title', 'author', 'available_copies', 'status'],
        'book_loans' => ['id', 'user_id', 'book_id', 'due_date', 'status']
    ];
    
    foreach ($requiredTables as $table => $columns) {
        try {
            $stmt = $db->query("DESCRIBE $table");
            $existingColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $missingColumns = array_diff($columns, $existingColumns);
            if (empty($missingColumns)) {
                echo "  ✓ Table '$table' is compatible\n";
            } else {
                echo "  ! Table '$table' missing columns: " . implode(', ', $missingColumns) . "\n";
            }
        } catch (PDOException $e) {
            echo "  ! Table '$table' does not exist or is not accessible\n";
        }
    }
    
    // Check if fines table exists, create if not
    try {
        $stmt = $db->query("DESCRIBE fines");
        echo "  ✓ Fines table exists\n";
    } catch (PDOException $e) {
        echo "  - Creating fines table...\n";
        $db->exec("
            CREATE TABLE fines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                loan_id INT,
                amount DECIMAL(10,2) NOT NULL,
                reason TEXT,
                status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (loan_id) REFERENCES book_loans(id) ON DELETE SET NULL
            )
        ");
        echo "  ✓ Fines table created\n";
    }
}

function checkAPICompatibility() {
    $apiFiles = [
        '/api/admin/settings.php',
        '/api/admin/maintenance.php',
        '/api/loans/policy-check.php',
        '/api/fines/calculate-overdue.php',
        '/api/users/policy-validation.php'
    ];
    
    foreach ($apiFiles as $apiFile) {
        $fullPath = __DIR__ . $apiFile;
        if (file_exists($fullPath)) {
            echo "  ✓ API file exists: $apiFile\n";
        } else {
            echo "  ! API file missing: $apiFile\n";
        }
    }
}

function createPerformanceIndexes($db) {
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_settings_category_key ON system_settings(category, setting_key)",
        "CREATE INDEX IF NOT EXISTS idx_settings_updated ON system_settings(updated_at)",
        "CREATE INDEX IF NOT EXISTS idx_loans_user_status ON book_loans(user_id, status)",
        "CREATE INDEX IF NOT EXISTS idx_loans_due_date ON book_loans(due_date)",
        "CREATE INDEX IF NOT EXISTS idx_fines_user_status ON fines(user_id, status)",
        "CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_log(started_at)",
        "CREATE INDEX IF NOT EXISTS idx_status_metric ON system_status(metric_name, recorded_at)"
    ];
    
    foreach ($indexes as $index) {
        try {
            $db->exec($index);
            if (preg_match('/idx_(\w+)/', $index, $matches)) {
                echo "  ✓ Created index: {$matches[1]}\n";
            }
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') === false) {
                echo "  ! Failed to create index: " . $e->getMessage() . "\n";
            }
        }
    }
}

function setupMaintenanceTasks($db) {
    // Insert initial system status metrics
    $metrics = [
        ['cpu_usage', 0, 'percent', 'healthy'],
        ['memory_usage', 0, 'percent', 'healthy'],
        ['storage_usage', 0, 'percent', 'healthy'],
        ['database_response_time', 0, 'milliseconds', 'healthy']
    ];
    
    $stmt = $db->prepare("
        INSERT IGNORE INTO system_status (metric_name, metric_value, metric_unit, status) 
        VALUES (?, ?, ?, ?)
    ");
    
    $inserted = 0;
    foreach ($metrics as $metric) {
        $stmt->execute($metric);
        if ($stmt->rowCount() > 0) {
            $inserted++;
        }
    }
    
    if ($inserted > 0) {
        echo "  ✓ Initialized {$inserted} system metrics\n";
    } else {
        echo "  - System metrics already initialized\n";
    }
    
    // Log the migration
    $stmt = $db->prepare("
        INSERT INTO maintenance_log (action, description, status, started_at, completed_at) 
        VALUES ('migration', 'Settings system migration completed', 'completed', NOW(), NOW())
    ");
    $stmt->execute();
    echo "  ✓ Migration logged\n";
}

function displayMigrationSummary($db) {
    echo "=== Migration Summary ===\n";
    
    // Count settings by category
    $stmt = $db->query("
        SELECT category, COUNT(*) as count 
        FROM system_settings 
        GROUP BY category 
        ORDER BY category
    ");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Settings by category:\n";
    foreach ($categories as $category) {
        echo "  - {$category['category']}: {$category['count']} settings\n";
    }
    
    // Check table sizes
    $tables = ['system_settings', 'settings_changelog', 'maintenance_log', 'system_status'];
    echo "\nTable status:\n";
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "  - $table: {$result['count']} records\n";
        } catch (PDOException $e) {
            echo "  - $table: Error reading table\n";
        }
    }
    
    echo "\nNext steps:\n";
    echo "1. Start the backend server: php -S localhost:8000 router.php\n";
    echo "2. Access admin settings at: http://localhost:3000/admin/settings\n";
    echo "3. Configure library policies as needed\n";
    echo "4. Test the policy enforcement in the loan system\n";
    echo "5. Set up automated fine calculations\n\n";
}
?>