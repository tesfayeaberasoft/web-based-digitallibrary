<?php
/**
 * System Maintenance API
 * Handles system maintenance operations
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins can perform maintenance
    if ($decoded['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'backup':
                handleBackupDatabase($db);
                break;
            case 'clearCache':
                handleClearCache();
                break;
            case 'optimizeDb':
                handleOptimizeDatabase($db);
                break;
            case 'updateIndex':
                handleUpdateSearchIndex($db);
                break;
            case 'exportLogs':
                handleExportLogs();
                break;
            case 'generateReport':
                handleGenerateReport($db);
                break;
            case 'systemStatus':
                handleSystemStatus($db);
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else if ($method === 'GET') {
        handleSystemStatus($db);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleBackupDatabase($db) {
    try {
        // Get database name from config
        $dbName = 'digital_library'; // This should come from config
        
        // Create backup directory if it doesn't exist
        $backupDir = __DIR__ . '/../../backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        // Generate backup filename
        $timestamp = date('Y-m-d_H-i-s');
        $backupFile = $backupDir . "/backup_{$dbName}_{$timestamp}.sql";
        
        // Create a simple backup by exporting table structures and data
        $tables = [];
        $stmt = $db->query("SHOW TABLES");
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }
        
        $backup = "-- Database Backup Created: " . date('Y-m-d H:i:s') . "\n";
        $backup .= "-- Database: {$dbName}\n\n";
        
        foreach ($tables as $table) {
            // Get table structure
            $stmt = $db->query("SHOW CREATE TABLE `{$table}`");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $backup .= "-- Table structure for `{$table}`\n";
            $backup .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $backup .= $row['Create Table'] . ";\n\n";
            
            // Get table data
            $stmt = $db->query("SELECT * FROM `{$table}`");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($rows)) {
                $backup .= "-- Data for table `{$table}`\n";
                foreach ($rows as $row) {
                    $values = array_map(function($value) use ($db) {
                        return $value === null ? 'NULL' : $db->quote($value);
                    }, array_values($row));
                    $backup .= "INSERT INTO `{$table}` VALUES (" . implode(', ', $values) . ");\n";
                }
                $backup .= "\n";
            }
        }
        
        // Write backup to file
        file_put_contents($backupFile, $backup);
        
        // Log backup
        logMaintenanceAction($db, 'backup', "Database backup created: " . basename($backupFile));
        
        echo json_encode([
            'success' => true,
            'message' => 'Database backup completed successfully',
            'backup_file' => basename($backupFile),
            'size' => formatBytes(filesize($backupFile))
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Backup failed: ' . $e->getMessage());
    }
}

function handleClearCache() {
    try {
        $cacheCleared = 0;
        
        // Clear various cache directories
        $cacheDirs = [
            __DIR__ . '/../../cache',
            __DIR__ . '/../../tmp',
            sys_get_temp_dir() . '/library_cache'
        ];
        
        foreach ($cacheDirs as $dir) {
            if (is_dir($dir)) {
                $files = glob($dir . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                        $cacheCleared++;
                    }
                }
            }
        }
        
        // Clear PHP opcache if available
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'System cache cleared successfully',
            'files_cleared' => $cacheCleared
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Cache clear failed: ' . $e->getMessage());
    }
}

function handleOptimizeDatabase($db) {
    try {
        $optimized = [];
        
        // Get all tables
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($tables as $table) {
            // Optimize each table
            $stmt = $db->query("OPTIMIZE TABLE `{$table}`");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $optimized[] = [
                'table' => $table,
                'status' => $result['Msg_text'] ?? 'OK'
            ];
        }
        
        // Log optimization
        logMaintenanceAction($db, 'optimize', "Database optimized: " . count($tables) . " tables");
        
        echo json_encode([
            'success' => true,
            'message' => 'Database optimization completed',
            'tables_optimized' => count($tables),
            'details' => $optimized
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Database optimization failed: ' . $e->getMessage());
    }
}

function handleUpdateSearchIndex($db) {
    try {
        // Update search indexes for books
        $stmt = $db->prepare("
            UPDATE books SET 
            search_index = CONCAT_WS(' ', title, author, isbn, description, category)
            WHERE search_index IS NULL OR search_index = ''
        ");
        $stmt->execute();
        $booksUpdated = $stmt->rowCount();
        
        // Update search indexes for users
        $stmt = $db->prepare("
            UPDATE users SET 
            search_index = CONCAT_WS(' ', full_name, email, user_id)
            WHERE search_index IS NULL OR search_index = ''
        ");
        $stmt->execute();
        $usersUpdated = $stmt->rowCount();
        
        // Log index update
        logMaintenanceAction($db, 'index_update', "Search index updated: {$booksUpdated} books, {$usersUpdated} users");
        
        echo json_encode([
            'success' => true,
            'message' => 'Search index updated successfully',
            'books_updated' => $booksUpdated,
            'users_updated' => $usersUpdated
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Search index update failed: ' . $e->getMessage());
    }
}

function handleExportLogs() {
    try {
        $logDir = __DIR__ . '/../../logs';
        $exportDir = __DIR__ . '/../../exports';
        
        if (!is_dir($exportDir)) {
            mkdir($exportDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $exportFile = $exportDir . "/system_logs_{$timestamp}.zip";
        
        // Create zip archive
        $zip = new ZipArchive();
        if ($zip->open($exportFile, ZipArchive::CREATE) === TRUE) {
            // Add log files to zip
            if (is_dir($logDir)) {
                $files = glob($logDir . '/*.log');
                foreach ($files as $file) {
                    $zip->addFile($file, basename($file));
                }
            }
            
            // Add system info
            $systemInfo = [
                'export_date' => date('Y-m-d H:i:s'),
                'php_version' => PHP_VERSION,
                'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time')
            ];
            $zip->addFromString('system_info.json', json_encode($systemInfo, JSON_PRETTY_PRINT));
            
            $zip->close();
            
            echo json_encode([
                'success' => true,
                'message' => 'System logs exported successfully',
                'export_file' => basename($exportFile),
                'size' => formatBytes(filesize($exportFile))
            ]);
        } else {
            throw new Exception('Failed to create export archive');
        }
        
    } catch (Exception $e) {
        throw new Exception('Log export failed: ' . $e->getMessage());
    }
}

function handleGenerateReport($db) {
    try {
        // Generate comprehensive system report
        $report = [
            'generated_at' => date('Y-m-d H:i:s'),
            'system_info' => getSystemInfo(),
            'database_stats' => getDatabaseStats($db),
            'user_stats' => getUserStats($db),
            'book_stats' => getBookStats($db),
            'loan_stats' => getLoanStats($db),
            'performance_metrics' => getPerformanceMetrics($db)
        ];
        
        // Save report to file
        $reportDir = __DIR__ . '/../../reports';
        if (!is_dir($reportDir)) {
            mkdir($reportDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $reportFile = $reportDir . "/system_report_{$timestamp}.json";
        file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT));
        
        // Log report generation
        logMaintenanceAction($db, 'report', "System report generated: " . basename($reportFile));
        
        echo json_encode([
            'success' => true,
            'message' => 'System report generated successfully',
            'report_file' => basename($reportFile),
            'report_data' => $report
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Report generation failed: ' . $e->getMessage());
    }
}

function handleSystemStatus($db) {
    try {
        $status = [
            'database' => getDatabaseStatus($db),
            'storage' => getStorageStatus(),
            'memory' => getMemoryStatus(),
            'cpu' => getCpuStatus(),
            'system_info' => getSystemInfo(),
            'recent_activity' => getRecentActivity($db)
        ];
        
        echo json_encode([
            'success' => true,
            'status' => $status
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to get system status: ' . $e->getMessage());
    }
}

// Helper functions
function logMaintenanceAction($db, $action, $description) {
    try {
        $stmt = $db->prepare("
            INSERT INTO maintenance_log (action, description, performed_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([$action, $description]);
    } catch (Exception $e) {
        // Log to file if database logging fails
        error_log("Maintenance log failed: " . $e->getMessage());
    }
}

function getDatabaseStatus($db) {
    try {
        $start = microtime(true);
        $stmt = $db->query("SELECT 1");
        $responseTime = round((microtime(true) - $start) * 1000, 2);
        
        return [
            'status' => 'healthy',
            'response_time' => $responseTime,
            'last_check' => date('Y-m-d H:i:s')
        ];
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'error' => $e->getMessage(),
            'last_check' => date('Y-m-d H:i:s')
        ];
    }
}

function getStorageStatus() {
    $bytes = disk_free_space('.');
    $total = disk_total_space('.');
    $used = $total - $bytes;
    
    return [
        'used' => round($used / (1024 * 1024 * 1024), 2),
        'total' => round($total / (1024 * 1024 * 1024), 2),
        'free' => round($bytes / (1024 * 1024 * 1024), 2),
        'usage_percent' => round(($used / $total) * 100, 2)
    ];
}

function getMemoryStatus() {
    $used = memory_get_usage(true);
    $limit = ini_get('memory_limit');
    $limitBytes = convertToBytes($limit);
    
    return [
        'used' => round($used / (1024 * 1024), 2),
        'limit' => round($limitBytes / (1024 * 1024), 2),
        'usage_percent' => $limitBytes > 0 ? round(($used / $limitBytes) * 100, 2) : 0
    ];
}

function getCpuStatus() {
    // Simple CPU usage estimation (not accurate on all systems)
    $load = sys_getloadavg();
    return [
        'load_1min' => $load[0] ?? 0,
        'load_5min' => $load[1] ?? 0,
        'load_15min' => $load[2] ?? 0,
        'usage_percent' => min(($load[0] ?? 0) * 100, 100)
    ];
}

function getSystemInfo() {
    return [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'operating_system' => PHP_OS,
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size')
    ];
}

function getDatabaseStats($db) {
    try {
        $stats = [];
        
        // Get table sizes
        $stmt = $db->query("
            SELECT 
                table_name,
                table_rows,
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        ");
        $stats['tables'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $stats;
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function getUserStats($db) {
    try {
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
                SUM(CASE WHEN role = 'librarian' THEN 1 ELSE 0 END) as librarians,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
            FROM users
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function getBookStats($db) {
    try {
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_books,
                COUNT(DISTINCT category) as categories,
                COUNT(DISTINCT author) as authors,
                SUM(CASE WHEN available_copies > 0 THEN 1 ELSE 0 END) as available_books,
                SUM(CASE WHEN available_copies = 0 THEN 1 ELSE 0 END) as unavailable_books
            FROM books
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function getLoanStats($db) {
    try {
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_loans,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_loans,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_loans
            FROM loans
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function getPerformanceMetrics($db) {
    try {
        // Simple performance metrics
        $start = microtime(true);
        $stmt = $db->query("SELECT COUNT(*) FROM users");
        $dbTime = microtime(true) - $start;
        
        return [
            'database_query_time' => round($dbTime * 1000, 2),
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ];
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function getRecentActivity($db) {
    try {
        $stmt = $db->query("
            SELECT action, description, performed_at 
            FROM maintenance_log 
            ORDER BY performed_at DESC 
            LIMIT 10
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return [];
    }
}

function convertToBytes($value) {
    $unit = strtolower(substr($value, -1));
    $value = (int) $value;
    
    switch ($unit) {
        case 'g': $value *= 1024;
        case 'm': $value *= 1024;
        case 'k': $value *= 1024;
    }
    
    return $value;
}

function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}
?>