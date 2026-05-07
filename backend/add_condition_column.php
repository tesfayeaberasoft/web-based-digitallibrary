<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Adding condition column to books table...\n\n";
    
    // Check if condition column already exists
    $stmt = $db->prepare("DESCRIBE books");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasCondition = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'condition_status') {
            $hasCondition = true;
            break;
        }
    }
    
    if (!$hasCondition) {
        echo "❌ condition_status column does not exist. Adding it...\n";
        
        $alterSql = "ALTER TABLE books ADD COLUMN condition_status ENUM('new', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good' AFTER status";
        $stmt = $db->prepare($alterSql);
        $stmt->execute();
        
        echo "✅ condition_status column added successfully!\n";
        
        // Update existing books to have 'good' condition by default
        $updateSql = "UPDATE books SET condition_status = 'good' WHERE condition_status IS NULL";
        $stmt = $db->prepare($updateSql);
        $stmt->execute();
        $updated = $stmt->rowCount();
        
        echo "✅ Updated $updated existing books with 'good' condition.\n";
    } else {
        echo "✅ condition_status column already exists.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>