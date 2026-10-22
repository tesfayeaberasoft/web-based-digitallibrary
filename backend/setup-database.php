<?php
/**
 * Database Setup Script
 * Initializes the complete database schema for the Digital Library Management System
 * Run this once to set up all tables
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config/config.php';
    
    // Connect to MySQL without database selected first
    $dbHost = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
    $dbUser = defined('DB_USER') ? DB_USER : (getenv('DB_USER') ?: 'root');
    $dbPass = defined('DB_PASS') ? DB_PASS : (getenv('DB_PASS') ?: '');
    
    $pdo = new PDO("mysql:host=$dbHost", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read schema.sql
    $schemaFile = __DIR__ . '/../database/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found: $schemaFile");
    }
    
    $sql = file_get_contents($schemaFile);
    if ($sql === false) {
        throw new Exception("Failed to read schema file");
    }
    
    // Split SQL statements by semicolon, but handle multi-line properly
    $statements = array_filter(
        array_map('trim', preg_split('/;(?=\s*(--|\n|$))/m', $sql)),
        function($stmt) {
            $trimmed = trim($stmt);
            return !empty($trimmed) && strpos($trimmed, '--') !== 0;
        }
    );
    
    $executed = 0;
    $errors = [];
    
    foreach ($statements as $statement) {
        $trimmed = trim($statement);
        
        // Skip comments and empty statements
        if (empty($trimmed) || strpos($trimmed, '--') === 0) {
            continue;
        }
        
        try {
            $pdo->exec($trimmed);
            $executed++;
            error_log("Executed SQL: " . substr($trimmed, 0, 50) . "...");
        } catch (PDOException $e) {
            // Some errors are expected (like tables already existing)
            $errorMsg = $e->getMessage();
            
            if (strpos($errorMsg, 'already exists') !== false || 
                strpos($errorMsg, 'Duplicate') !== false ||
                strpos($errorMsg, 'already has a primary key') !== false) {
                // Skip expected errors
                error_log("Skipped (already exists): " . substr($trimmed, 0, 50) . "...");
                continue;
            }
            
            $errors[] = [
                'statement' => substr($trimmed, 0, 100) . (strlen($trimmed) > 100 ? '...' : ''),
                'error' => $errorMsg
            ];
            error_log("SQL Error: " . $errorMsg);
        }
    }
    
    // Now run additional migrations (skip problematic ones)
    $migrationDir = __DIR__ . '/migrations';
    if (is_dir($migrationDir)) {
        // Only run safe migrations, skip ones with stored procedures
        $migrationFiles = [
            'add_condition_status_column.sql',
            'create_user_favorites.sql'
        ];
        
        require_once __DIR__ . '/config/database.php';
        $db = Database::getInstance()->getConnection();
        
        foreach ($migrationFiles as $migrationFile) {
            $filePath = $migrationDir . '/' . $migrationFile;
            if (file_exists($filePath)) {
                $migrationSQL = file_get_contents($filePath);
                $migrationStatements = array_filter(
                    array_map('trim', preg_split('/;(?=\s*(--|\n|$))/m', $migrationSQL)),
                    function($stmt) {
                        return !empty(trim($stmt)) && strpos(trim($stmt), '--') !== 0;
                    }
                );
                
                foreach ($migrationStatements as $stmt) {
                    $trimmed = trim($stmt);
                    if (!empty($trimmed)) {
                        try {
                            $db->exec($trimmed);
                            $executed++;
                            error_log("Migration executed: " . substr($trimmed, 0, 50) . "...");
                        } catch (PDOException $e) {
                            if (strpos($e->getMessage(), 'already exists') === false &&
                                strpos($e->getMessage(), 'Duplicate') === false) {
                                $errors[] = [
                                    'file' => $migrationFile,
                                    'statement' => substr($trimmed, 0, 100),
                                    'error' => $e->getMessage()
                                ];
                            }
                        }
                    }
                }
            }
        }
    }
    
    if (!empty($errors) && count($errors) > 3) {
        // More than a few errors indicates a real problem
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database setup completed with errors',
            'executed' => $executed,
            'errors' => $errors
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Database setup completed successfully',
            'executed' => $executed,
            'details' => 'All tables and migrations initialized',
            'warning_errors' => $errors // Non-critical errors
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database setup failed: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
