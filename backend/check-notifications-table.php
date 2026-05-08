<?php
require_once 'config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "=== Notifications Table Schema ===\n";
    $stmt = $db->prepare('DESCRIBE notifications');
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Notifications table columns:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - Default: {$column['Default']}\n";
    }
    
    // Check if created_at exists
    $has_created_at = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'created_at') {
            $has_created_at = true;
            break;
        }
    }
    
    echo "\nCreated_at column exists in notifications: " . ($has_created_at ? "YES" : "NO") . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>