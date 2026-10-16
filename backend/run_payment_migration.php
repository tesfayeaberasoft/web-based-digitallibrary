<?php
/**
 * Payment Migration Script
 * Run this file once to create the Chapa payment integration tables
 * 
 * Usage: php run_payment_migration.php
 */

require_once __DIR__ . '/config/database.php';

try {
    echo "=================================================================\n";
    echo "CHAPA PAYMENT GATEWAY - DATABASE MIGRATION\n";
    echo "=================================================================\n\n";
    
    // Read the migration SQL file
    $sqlFile = __DIR__ . '/migrations/create_payments_table.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: $sqlFile");
    }
    
    echo "Reading migration file...\n";
    $sql = file_get_contents($sqlFile);
    
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }
    
    echo "Connected to database successfully.\n\n";
    echo "Executing migration...\n";
    echo "-----------------------------------------------------------------\n";
    
    // Split SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && 
                   !preg_match('/^--/', $stmt) && 
                   !preg_match('/^\/\*/', $stmt);
        }
    );
    
    $successCount = 0;
    $errorCount = 0;
    
    // Execute each statement
    foreach ($statements as $index => $statement) {
        // Skip comments and empty statements
        if (empty(trim($statement)) || 
            strpos(trim($statement), '--') === 0 || 
            strpos(trim($statement), '/*') === 0) {
            continue;
        }
        
        try {
            $conn->exec($statement);
            $successCount++;
            
            // Show progress for important operations
            if (stripos($statement, 'CREATE TABLE') !== false) {
                preg_match('/CREATE TABLE[^`]*`?([a-z_]+)`?/i', $statement, $matches);
                $tableName = $matches[1] ?? 'unknown';
                echo "✓ Created table: $tableName\n";
            } elseif (stripos($statement, 'ALTER TABLE') !== false) {
                preg_match('/ALTER TABLE[^`]*`?([a-z_]+)`?/i', $statement, $matches);
                $tableName = $matches[1] ?? 'unknown';
                echo "✓ Altered table: $tableName\n";
            } elseif (stripos($statement, 'CREATE PROCEDURE') !== false) {
                preg_match('/CREATE PROCEDURE[^`]*`?([a-z_]+)`?/i', $statement, $matches);
                $procName = $matches[1] ?? 'unknown';
                echo "✓ Created procedure: $procName\n";
            } elseif (stripos($statement, 'CREATE TRIGGER') !== false) {
                preg_match('/CREATE TRIGGER[^`]*`?([a-z_]+)`?/i', $statement, $matches);
                $triggerName = $matches[1] ?? 'unknown';
                echo "✓ Created trigger: $triggerName\n";
            }
        } catch (PDOException $e) {
            // Ignore "already exists" errors
            if (strpos($e->getMessage(), 'already exists') === false && 
                strpos($e->getMessage(), 'Duplicate') === false) {
                echo "✗ Error: " . $e->getMessage() . "\n";
                $errorCount++;
            }
        }
    }
    
    echo "-----------------------------------------------------------------\n\n";
    echo "Migration completed!\n";
    echo "Successful operations: $successCount\n";
    echo "Errors (ignored): $errorCount\n\n";
    
    // Verify tables were created
    echo "Verifying tables...\n";
    $tables = ['payments', 'payment_logs', 'payment_settings'];
    
    foreach ($tables as $table) {
        $stmt = $conn->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✓ Table '$table' exists\n";
            
            // Show row count
            $countStmt = $conn->query("SELECT COUNT(*) as count FROM $table");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "  └─ Rows: $count\n";
        } else {
            echo "✗ Table '$table' NOT FOUND\n";
        }
    }
    
    echo "\n=================================================================\n";
    echo "MIGRATION SUCCESSFUL! You can now use Chapa payment gateway.\n";
    echo "=================================================================\n";
    
} catch (Exception $e) {
    echo "\n❌ MIGRATION FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPlease check your database connection and try again.\n";
    exit(1);
}
