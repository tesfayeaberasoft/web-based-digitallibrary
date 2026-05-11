<?php
/**
 * Super Admin System Management API
 * Advanced system management and control operations
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
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'promote_user':
                handlePromoteUser($db, $data);
                break;
            case 'demote_user':
                handleDemoteUser($db, $data);
                break;
            case 'system_maintenance':
                handleSystemMaintenance($db, $data);
                break;
            case 'bulk_user_action':
                handleBulkUserAction($db, $data);
                break;
            case 'security_action':
                handleSecurityAction($db, $data);
                break;
            case 'backup_system':
                handleBackupSystem($db);
                break;
            case 'clear_logs':
                handleClearLogs($db, $data);
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handlePromoteUser($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        $newRole = $data['new_role'] ?? null;
        
        if (!$userId || !$newRole) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID and new role are required']);
            return;
        }
        
        // Validate role
        $validRoles = ['user', 'librarian', 'admin', 'super-admin'];
        if (!in_array($newRole, $validRoles)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid role']);
            return;
        }
        
        // Get current user info
        $stmt = $db->prepare("SELECT full_name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Update user role
        $stmt = $db->prepare("UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        
        // Log the action
        logSystemAction($db, 'user_role_change', "Changed {$user['full_name']} ({$user['email']}) role from {$user['role']} to {$newRole}");
        
        echo json_encode([
            'success' => true,
            'message' => "User role updated successfully",
            'user' => [
                'name' => $user['full_name'],
                'email' => $user['email'],
                'old_role' => $user['role'],
                'new_role' => $newRole
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to promote user: ' . $e->getMessage());
    }
}

function handleDemoteUser($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        // Get current user info
        $stmt = $db->prepare("SELECT full_name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Determine demotion path
        $demotionMap = [
            'super-admin' => 'admin',
            'admin' => 'librarian',
            'librarian' => 'user',
            'user' => 'user' // Can't demote further
        ];
        
        $newRole = $demotionMap[$user['role']] ?? 'user';
        
        if ($newRole === $user['role']) {
            echo json_encode([
                'success' => false,
                'message' => 'User cannot be demoted further'
            ]);
            return;
        }
        
        // Update user role
        $stmt = $db->prepare("UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        
        // Log the action
        logSystemAction($db, 'user_demotion', "Demoted {$user['full_name']} ({$user['email']}) from {$user['role']} to {$newRole}");
        
        echo json_encode([
            'success' => true,
            'message' => "User demoted successfully",
            'user' => [
                'name' => $user['full_name'],
                'email' => $user['email'],
                'old_role' => $user['role'],
                'new_role' => $newRole
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to demote user: ' . $e->getMessage());
    }
}

function handleSystemMaintenance($db, $data) {
    try {
        $maintenanceType = $data['maintenance_type'] ?? null;
        
        switch ($maintenanceType) {
            case 'enable_maintenance_mode':
                // Enable maintenance mode
                $stmt = $db->prepare("
                    INSERT INTO system_settings (category, setting_key, setting_value) 
                    VALUES ('system', 'maintenance_mode', 'true')
                    ON DUPLICATE KEY UPDATE setting_value = 'true'
                ");
                $stmt->execute();
                
                logSystemAction($db, 'maintenance_mode', 'Maintenance mode enabled');
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Maintenance mode enabled'
                ]);
                break;
                
            case 'disable_maintenance_mode':
                // Disable maintenance mode
                $stmt = $db->prepare("
                    INSERT INTO system_settings (category, setting_key, setting_value) 
                    VALUES ('system', 'maintenance_mode', 'false')
                    ON DUPLICATE KEY UPDATE setting_value = 'false'
                ");
                $stmt->execute();
                
                logSystemAction($db, 'maintenance_mode', 'Maintenance mode disabled');
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Maintenance mode disabled'
                ]);
                break;
                
            case 'clear_cache':
                // Clear system cache
                $cacheCleared = clearSystemCache();
                
                logSystemAction($db, 'cache_clear', "System cache cleared: {$cacheCleared} files");
                
                echo json_encode([
                    'success' => true,
                    'message' => "Cache cleared: {$cacheCleared} files removed"
                ]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid maintenance type']);
        }
        
    } catch (Exception $e) {
        throw new Exception('Failed to perform maintenance: ' . $e->getMessage());
    }
}

function handleBulkUserAction($db, $data) {
    try {
        $userIds = $data['user_ids'] ?? [];
        $action = $data['bulk_action'] ?? null;
        
        if (empty($userIds) || !$action) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User IDs and action are required']);
            return;
        }
        
        $placeholders = str_repeat('?,', count($userIds) - 1) . '?';
        $affectedUsers = 0;
        
        switch ($action) {
            case 'suspend':
                $stmt = $db->prepare("UPDATE users SET status = 'suspended' WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $affectedUsers = $stmt->rowCount();
                
                logSystemAction($db, 'bulk_suspend', "Suspended {$affectedUsers} users");
                break;
                
            case 'activate':
                $stmt = $db->prepare("UPDATE users SET status = 'active' WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $affectedUsers = $stmt->rowCount();
                
                logSystemAction($db, 'bulk_activate', "Activated {$affectedUsers} users");
                break;
                
            case 'delete':
                // Soft delete - change status to deleted
                $stmt = $db->prepare("UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $affectedUsers = $stmt->rowCount();
                
                logSystemAction($db, 'bulk_delete', "Deleted {$affectedUsers} users");
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid bulk action']);
                return;
        }
        
        echo json_encode([
            'success' => true,
            'message' => "Bulk action completed: {$affectedUsers} users affected",
            'affected_count' => $affectedUsers
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to perform bulk action: ' . $e->getMessage());
    }
}

function handleSecurityAction($db, $data) {
    try {
        $securityAction = $data['security_action'] ?? null;
        
        switch ($securityAction) {
            case 'clear_failed_logins':
                // Clear failed login attempts
                $stmt = $db->prepare("DELETE FROM login_attempts WHERE success = 0");
                $stmt->execute();
                $cleared = $stmt->rowCount();
                
                logSystemAction($db, 'security_clear', "Cleared {$cleared} failed login attempts");
                
                echo json_encode([
                    'success' => true,
                    'message' => "Cleared {$cleared} failed login attempts"
                ]);
                break;
                
            case 'force_password_reset':
                $userIds = $data['user_ids'] ?? [];
                if (empty($userIds)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'User IDs required']);
                    return;
                }
                
                // Mark users for password reset
                $placeholders = str_repeat('?,', count($userIds) - 1) . '?';
                $stmt = $db->prepare("UPDATE users SET password_reset_required = 1 WHERE id IN ($placeholders)");
                $stmt->execute($userIds);
                $affected = $stmt->rowCount();
                
                logSystemAction($db, 'force_password_reset', "Forced password reset for {$affected} users");
                
                echo json_encode([
                    'success' => true,
                    'message' => "Password reset required for {$affected} users"
                ]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid security action']);
        }
        
    } catch (Exception $e) {
        throw new Exception('Failed to perform security action: ' . $e->getMessage());
    }
}

function handleBackupSystem($db) {
    try {
        // Create system backup
        $backupDir = __DIR__ . '/../../backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $backupFile = $backupDir . "/super_admin_backup_{$timestamp}.sql";
        
        // Get all tables
        $tables = [];
        $stmt = $db->query("SHOW TABLES");
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }
        
        $backup = "-- Super Admin System Backup\n";
        $backup .= "-- Created: " . date('Y-m-d H:i:s') . "\n\n";
        
        foreach ($tables as $table) {
            // Get table structure
            $stmt = $db->query("SHOW CREATE TABLE `{$table}`");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $backup .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $backup .= $row['Create Table'] . ";\n\n";
            
            // Get table data
            $stmt = $db->query("SELECT * FROM `{$table}`");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($rows)) {
                foreach ($rows as $row) {
                    $values = array_map(function($value) use ($db) {
                        return $value === null ? 'NULL' : $db->quote($value);
                    }, array_values($row));
                    $backup .= "INSERT INTO `{$table}` VALUES (" . implode(', ', $values) . ");\n";
                }
                $backup .= "\n";
            }
        }
        
        file_put_contents($backupFile, $backup);
        
        logSystemAction($db, 'system_backup', "Full system backup created: " . basename($backupFile));
        
        echo json_encode([
            'success' => true,
            'message' => 'System backup completed successfully',
            'backup_file' => basename($backupFile),
            'size' => formatBytes(filesize($backupFile))
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to create backup: ' . $e->getMessage());
    }
}

function handleClearLogs($db, $data) {
    try {
        $logType = $data['log_type'] ?? 'all';
        $olderThan = $data['older_than_days'] ?? 30;
        
        $cleared = 0;
        
        switch ($logType) {
            case 'login_attempts':
                $stmt = $db->prepare("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL ? DAY)");
                $stmt->execute([$olderThan]);
                $cleared = $stmt->rowCount();
                break;
                
            case 'system_logs':
                $stmt = $db->prepare("DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)");
                $stmt->execute([$olderThan]);
                $cleared = $stmt->rowCount();
                break;
                
            case 'all':
                // Clear multiple log types
                $tables = ['login_attempts', 'system_logs', 'maintenance_log'];
                foreach ($tables as $table) {
                    try {
                        $stmt = $db->prepare("DELETE FROM {$table} WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) OR attempted_at < DATE_SUB(NOW(), INTERVAL ? DAY)");
                        $stmt->execute([$olderThan, $olderThan]);
                        $cleared += $stmt->rowCount();
                    } catch (Exception $e) {
                        // Table might not exist, continue
                    }
                }
                break;
        }
        
        logSystemAction($db, 'logs_cleared', "Cleared {$cleared} log entries older than {$olderThan} days");
        
        echo json_encode([
            'success' => true,
            'message' => "Cleared {$cleared} log entries",
            'cleared_count' => $cleared
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to clear logs: ' . $e->getMessage());
    }
}

function logSystemAction($db, $action, $description) {
    try {
        $stmt = $db->prepare("
            INSERT INTO system_logs (action, description, performed_at) 
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$action, $description]);
    } catch (Exception $e) {
        // Log to file if database logging fails
        error_log("System action log failed: " . $e->getMessage());
    }
}

function clearSystemCache() {
    $cleared = 0;
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
                    $cleared++;
                }
            }
        }
    }
    
    return $cleared;
}

function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}
?>