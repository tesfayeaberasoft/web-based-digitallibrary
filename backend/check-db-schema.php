<?php
// Check database schema for users table
require_once 'config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "=== Checking Users Table Schema ===\n";
    
    // Check if users table exists and get its structure
    $stmt = $db->prepare("DESCRIBE users");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users table columns:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Default']}\n";
    }
    
    // Check if updated_at column exists
    $has_updated_at = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'updated_at') {
            $has_updated_at = true;
            break;
        }
    }
    
    echo "\nUpdated_at column exists: " . ($has_updated_at ? "YES" : "NO") . "\n";
    
    // Check for any foreign key constraints that might prevent deletion
    echo "\n=== Checking Foreign Key Constraints ===\n";
    $stmt = $db->prepare("
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_NAME = 'users'
        AND TABLE_SCHEMA = DATABASE()
    ");
    $stmt->execute();
    $constraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($constraints)) {
        echo "No foreign key constraints found referencing users table.\n";
    } else {
        echo "Foreign key constraints referencing users table:\n";
        foreach ($constraints as $constraint) {
            echo "- {$constraint['TABLE_NAME']}.{$constraint['COLUMN_NAME']} -> users.{$constraint['REFERENCED_COLUMN_NAME']}\n";
        }
    }
    
    // Test a simple user query
    echo "\n=== Testing User Queries ===\n";
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $count = $stmt->fetch()['count'];
    echo "Total users in database: $count\n";
    
    // Check if there are any users with active loans
    $stmt = $db->prepare("
        SELECT u.id, u.full_name, COUNT(bl.id) as active_loans
        FROM users u
        LEFT JOIN book_loans bl ON u.id = bl.user_id AND bl.status = 'active'
        GROUP BY u.id
        HAVING active_loans > 0
        LIMIT 5
    ");
    $stmt->execute();
    $users_with_loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nUsers with active loans:\n";
    if (empty($users_with_loans)) {
        echo "No users have active loans.\n";
    } else {
        foreach ($users_with_loans as $user) {
            echo "- {$user['full_name']} (ID: {$user['id']}) has {$user['active_loans']} active loans\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>