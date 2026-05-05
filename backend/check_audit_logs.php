<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();

echo "Checking audit_logs table structure...\n\n";

try {
    $stmt = $db->query("DESCRIBE audit_logs");
    echo "Columns in audit_logs:\n";
    while($col = $stmt->fetch()) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nTable might not exist. Checking if it exists...\n";
    
    $stmt = $db->query("SHOW TABLES LIKE 'audit_logs'");
    if ($stmt->rowCount() == 0) {
        echo "❌ audit_logs table does NOT exist!\n";
    }
}
?>
