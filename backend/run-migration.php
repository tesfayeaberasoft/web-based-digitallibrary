<?php
/**
 * Migration Runner Script
 * Run this file to execute database migrations
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    
    // Read the migration file
    $migrationFile = __DIR__ . '/migrations/add_condition_status_column.sql';
    
    if (!file_exists($migrationFile)) {
        throw new Exception('Migration file not found: add_condition_status_column.sql');
    }
    
    $sql = file_get_contents($migrationFile);
    
    if ($sql === false) {
        throw new Exception('Failed to read migration file');
    }
    
    // Split SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && strpos($stmt, '--') !== 0;
        }
    );
    
    $executed = 0;
    $errors = [];
    
    foreach ($statements as $statement) {
        // Skip comments
        if (empty($statement) || strpos(trim($statement), '--') === 0) {
            continue;
        }
        
        try {
            $db->exec($statement);
            $executed++;
        } catch (PDOException $e) {
            // Check if error is about column already existing
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                // Column already exists, that's fine
                continue;
            }
            $errors[] = [
                'statement' => substr($statement, 0, 100) . '...',
                'error' => $e->getMessage()
            ];
        }
    }
    
    if (!empty($errors)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Migration completed with errors',
            'executed' => $executed,
            'errors' => $errors
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Migration completed successfully',
            'executed' => $executed,
            'details' => 'Added condition_status column to books table'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
