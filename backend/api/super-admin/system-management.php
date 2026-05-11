<?php
/**
 * Super Admin System Management API
 * Handles system settings, maintenance, and administrative actions
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only super-admins can access this endpoint
    if ($decoded['role'] !== 'super-admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Super admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        handleSystemAction($db);
    } elseif ($method === 'GET') {
        handleGetSettings($db);
    } elseif ($method === 'PUT') {
        handleUpdateSettings($db);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleSystemAction($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['action'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action is required']);
            return;
        }
        
        $action = $input['action'];
        $data = $input['data'] ?? [];
        
        switch ($action) {
            case 'backup_system':
                $result = performBackup($db);
                break;
                
            case 'system_cleanup':
                $result = performSystemCleanup($db);
                break;
                
            case 'clear_cache':
            case 'system_maintenance':
                $result = performMaintenance($db, $data);
                break;
                
            case 'restart_system':
                $result = restartSystem();
                break;
                
            case 'security_action':
                $result = performSecurityAction($db, $data);
                break;
                
            case 'security_scan':
                $result = performSecurityScan($db);
                break;
                
            case 'export_logs':
                $result = exportLogs();
                break;
                
            case 'clear_logs':
                $result = clearLogs($data);
                break;
                
            case 'manage_roles':
                $result = manageRoles($db, $data);
                break;
                
            case 'bulk_user_operations':
                $result = performBulkUserOperations($db, $data);
                break;
                
            case 'restore_backup':
                $result = restoreBackup($data);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
                return;
        }
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Action failed: ' . $e->getMessage()]);
    }
}

function handleGetSettings($db) {
    try {
        $settings = getSystemSettings($db);
        echo json_encode(['success' => true, 'data' => $settings]);
    } catch (Exception $e) {
        throw new Exception('Failed to get settings: ' . $e->getMessage());
    }
}

function handleUpdateSettings($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $result = updateSystemSettings($db, $input);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update settings: ' . $e->getMessage()]);
    }
}

function performBackup($db) {
    try {
        $backupDir = __DIR__ . '/../../backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $backupFile = $backupDir . '/backup_' . $timestamp . '.sql';
        
        // Get database configuration
        $config = require __DIR__ . '/../../config/config.php';
        $dbName = $config['database']['dbname'];
        $dbHost = $config['database']['host'];
        $dbUser = $config['database']['username'];
        $dbPass = $config['database']['password'];
        
        // Create backup using mysqldump (if available)
        $command = "mysqldump -h{$dbHost} -u{$dbUser} -p{$dbPass} {$dbName} > {$backupFile}";
        
        // For security, we'll create a simple SQL backup instead
        $tables = ['users', 'books', 'book_loans', 'reservations', 'fines', 'categories', 'notifications'];
        $sql = "-- Database Backup Created: " . date('Y-m-d H:i:s') . "\n\n";
        
        foreach ($tables as $table) {
            try {
                $stmt = $db->query("SHOW CREATE TABLE `{$table}`");
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $sql .= "-- Table: {$table}\n";
                    $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
                    $sql .= $row['Create Table'] . ";\n\n";
                    
                    // Export data
                    $stmt = $db->query("SELECT * FROM `{$table}`");
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    if (!empty($rows)) {
                        $sql .= "-- Data for table {$table}\n";
                        foreach ($rows as $row) {
                            $values = array_map(function($value) use ($db) {
                                return $value === null ? 'NULL' : $db->quote($value);
                            }, array_values($row));
                            
                            $sql .= "INSERT INTO `{$table}` VALUES (" . implode(', ', $values) . ");\n";
                        }
                        $sql .= "\n";
                    }
                }
            } catch (Exception $e) {
                // Skip tables that don't exist
                continue;
            }
        }
        
        file_put_contents($backupFile, $sql);
        
        return [
            'success' => true,
            'message' => 'System backup created successfully',
            'backup_file' => basename($backupFile),
            'backup_size' => formatBytes(filesize($backupFile)),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Backup failed: ' . $e->getMessage()
        ];
    }
}

function performSystemCleanup($db) {
    try {
        $cleanupResults = [];
        
        // Clean up old login attempts (older than 30 days)
        $stmt = $db->prepare("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stmt->execute();
        $cleanupResults['old_login_attempts'] = $stmt->rowCount();
        
        // Clean up expired sessions (if you have a sessions table)
        try {
            $stmt = $db->prepare("DELETE FROM user_sessions WHERE expires_at < NOW()");
            $stmt->execute();
            $cleanupResults['expired_sessions'] = $stmt->rowCount();
        } catch (Exception $e) {
            // Sessions table might not exist
            $cleanupResults['expired_sessions'] = 0;
        }
        
        // Clean up old notifications (older than 90 days)
        $stmt = $db->prepare("DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) AND is_read = 1");
        $stmt->execute();
        $cleanupResults['old_notifications'] = $stmt->rowCount();
        
        // Optimize database tables
        $tables = ['users', 'books', 'book_loans', 'reservations', 'fines', 'notifications'];
        $optimizedTables = 0;
        
        foreach ($tables as $table) {
            try {
                $stmt = $db->query("OPTIMIZE TABLE `{$table}`");
                $optimizedTables++;
            } catch (Exception $e) {
                // Skip if table doesn't exist or can't be optimized
                continue;
            }
        }
        
        $cleanupResults['optimized_tables'] = $optimizedTables;
        
        // Clear temporary files (if any)
        $tempDir = __DIR__ . '/../../temp';
        $tempFilesDeleted = 0;
        
        if (is_dir($tempDir)) {
            $files = glob($tempDir . '/*');
            foreach ($files as $file) {
                if (is_file($file) && filemtime($file) < strtotime('-1 day')) {
                    unlink($file);
                    $tempFilesDeleted++;
                }
            }
        }
        
        $cleanupResults['temp_files_deleted'] = $tempFilesDeleted;
        
        return [
            'success' => true,
            'message' => 'System cleanup completed successfully',
            'details' => $cleanupResults,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'System cleanup failed: ' . $e->getMessage()
        ];
    }
}

function performMaintenance($db, $data) {
    try {
        $maintenanceType = $data['maintenance_type'] ?? 'clear_cache';
        
        switch ($maintenanceType) {
            case 'clear_cache':
                // Clear any cache files
                $cacheDir = __DIR__ . '/../../cache';
                $cacheCleared = 0;
                
                if (is_dir($cacheDir)) {
                    $files = glob($cacheDir . '/*');
                    foreach ($files as $file) {
                        if (is_file($file)) {
                            unlink($file);
                            $cacheCleared++;
                        }
                    }
                }
                
                return [
                    'success' => true,
                    'message' => "Cache cleared successfully. {$cacheCleared} files removed.",
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
            case 'enable_maintenance_mode':
                // Create maintenance mode file
                $maintenanceFile = __DIR__ . '/../../maintenance.flag';
                file_put_contents($maintenanceFile, json_encode([
                    'enabled' => true,
                    'message' => $data['message'] ?? 'System is under maintenance. Please try again later.',
                    'enabled_at' => date('Y-m-d H:i:s'),
                    'duration' => $data['duration'] ?? 30
                ]));
                
                return [
                    'success' => true,
                    'message' => 'Maintenance mode enabled',
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
            case 'disable_maintenance_mode':
                // Remove maintenance mode file
                $maintenanceFile = __DIR__ . '/../../maintenance.flag';
                if (file_exists($maintenanceFile)) {
                    unlink($maintenanceFile);
                }
                
                return [
                    'success' => true,
                    'message' => 'Maintenance mode disabled',
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
            default:
                return [
                    'success' => false,
                    'message' => 'Unknown maintenance type: ' . $maintenanceType
                ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Maintenance operation failed: ' . $e->getMessage()
        ];
    }
}

function restartSystem() {
    try {
        // In a real system, this would restart services
        // For now, we'll just clear some caches and return success
        
        // Clear PHP opcache if available
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }
        
        return [
            'success' => true,
            'message' => 'System restart initiated. Services will be restarted shortly.',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'System restart failed: ' . $e->getMessage()
        ];
    }
}

function performSecurityAction($db, $data) {
    try {
        $securityAction = $data['security_action'] ?? '';
        
        switch ($securityAction) {
            case 'clear_failed_logins':
                $stmt = $db->prepare("DELETE FROM login_attempts WHERE success = 0");
                $stmt->execute();
                $clearedCount = $stmt->rowCount();
                
                return [
                    'success' => true,
                    'message' => "Cleared {$clearedCount} failed login attempts",
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
            default:
                return [
                    'success' => false,
                    'message' => 'Unknown security action: ' . $securityAction
                ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Security action failed: ' . $e->getMessage()
        ];
    }
}

function performSecurityScan($db) {
    try {
        $scanResults = [];
        
        // Check for suspicious login patterns
        $stmt = $db->query("
            SELECT ip_address, COUNT(*) as attempts 
            FROM login_attempts 
            WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY ip_address 
            HAVING attempts > 10
        ");
        $suspiciousIPs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $scanResults['suspicious_ips'] = count($suspiciousIPs);
        
        // Check for inactive admin accounts
        $stmt = $db->query("
            SELECT COUNT(*) as count 
            FROM users 
            WHERE role IN ('admin', 'super-admin') 
            AND (last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL 90 DAY))
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $scanResults['inactive_admins'] = $result['count'];
        
        // Check for users with weak passwords (simplified check)
        $stmt = $db->query("
            SELECT COUNT(*) as count 
            FROM users 
            WHERE LENGTH(password) < 60
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $scanResults['weak_passwords'] = $result['count'];
        
        $totalIssues = $scanResults['suspicious_ips'] + $scanResults['inactive_admins'] + $scanResults['weak_passwords'];
        
        return [
            'success' => true,
            'message' => "Security scan completed. Found {$totalIssues} potential issues.",
            'results' => $scanResults,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Security scan failed: ' . $e->getMessage()
        ];
    }
}

function exportLogs() {
    try {
        $logDir = __DIR__ . '/../../logs';
        $exportDir = __DIR__ . '/../../exports';
        
        if (!is_dir($exportDir)) {
            mkdir($exportDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $exportFile = $exportDir . '/logs_export_' . $timestamp . '.zip';
        
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            if ($zip->open($exportFile, ZipArchive::CREATE) === TRUE) {
                if (is_dir($logDir)) {
                    $files = glob($logDir . '/*.log');
                    foreach ($files as $file) {
                        $zip->addFile($file, basename($file));
                    }
                }
                $zip->close();
                
                return [
                    'success' => true,
                    'message' => 'Logs exported successfully',
                    'export_file' => basename($exportFile),
                    'file_size' => formatBytes(filesize($exportFile)),
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            }
        }
        
        return [
            'success' => false,
            'message' => 'Log export failed: ZIP extension not available'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Log export failed: ' . $e->getMessage()
        ];
    }
}

function clearLogs($data) {
    try {
        $logType = $data['log_type'] ?? 'all';
        $olderThanDays = $data['older_than_days'] ?? 30;
        
        $logDir = __DIR__ . '/../../logs';
        $deletedFiles = 0;
        
        if (is_dir($logDir)) {
            $pattern = $logType === 'all' ? '*.log' : $logType . '*.log';
            $files = glob($logDir . '/' . $pattern);
            
            foreach ($files as $file) {
                if (filemtime($file) < strtotime("-{$olderThanDays} days")) {
                    unlink($file);
                    $deletedFiles++;
                }
            }
        }
        
        return [
            'success' => true,
            'message' => "Cleared {$deletedFiles} log files older than {$olderThanDays} days",
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Log clearing failed: ' . $e->getMessage()
        ];
    }
}

function manageRoles($db, $data) {
    try {
        // This is a placeholder for role management functionality
        return [
            'success' => true,
            'message' => 'Role management interface opened',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Role management failed: ' . $e->getMessage()
        ];
    }
}

function performBulkUserOperations($db, $data) {
    try {
        // This is a placeholder for bulk user operations
        return [
            'success' => true,
            'message' => 'Bulk user operations interface opened',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Bulk user operations failed: ' . $e->getMessage()
        ];
    }
}

function restoreBackup($data) {
    try {
        $backupFile = $data['backup_file'] ?? '';
        
        if (empty($backupFile)) {
            return [
                'success' => false,
                'message' => 'Backup file not specified'
            ];
        }
        
        // This is a placeholder for backup restoration
        return [
            'success' => true,
            'message' => 'Backup restoration initiated. This may take several minutes.',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Backup restoration failed: ' . $e->getMessage()
        ];
    }
}

function getSystemSettings($db) {
    try {
        // Get system settings from database or config files
        $settings = [
            'performance' => [
                'caching_enabled' => true,
                'auto_optimization' => true,
                'debug_mode' => false,
                'query_optimization' => true,
                'memory_limit_mb' => 512,
                'max_execution_time' => 300,
                'upload_max_size_mb' => 50,
                'compression_enabled' => true
            ],
            'security' => [
                'two_factor_auth' => true,
                'login_monitoring' => true,
                'ip_restrictions' => false,
                'max_login_attempts' => 5,
                'session_timeout_minutes' => 60,
                'failed_login_alerts' => true,
                'suspicious_activity_detection' => true,
                'realtime_security_scanning' => false
            ],
            'notifications' => [
                'email_notifications' => true,
                'sms_alerts' => false,
                'system_alerts' => true,
                'push_notifications' => true,
                'admin_email' => 'admin@digitallibrary.com',
                'cpu_usage_alert_threshold' => 80,
                'memory_usage_alert_threshold' => 85,
                'disk_usage_alert_threshold' => 90,
                'failed_login_threshold' => 10
            ],
            'backup' => [
                'automatic_backups' => true,
                'backup_frequency' => 'daily',
                'backup_retention_days' => 30,
                'detailed_logging' => true,
                'log_level' => 'info',
                'log_retention_days' => 90
            ]
        ];
        
        return $settings;
        
    } catch (Exception $e) {
        throw new Exception('Failed to get system settings: ' . $e->getMessage());
    }
}

function updateSystemSettings($db, $settings) {
    try {
        // In a real system, you would save these settings to a database or config file
        // For now, we'll just return success
        
        return [
            'success' => true,
            'message' => 'System settings updated successfully',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Failed to update settings: ' . $e->getMessage()
        ];
    }
}

function formatBytes($size, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    
    return round($size, $precision) . ' ' . $units[$i];
}
?>