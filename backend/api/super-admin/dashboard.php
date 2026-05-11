<?php
/**
 * Super Admin Dashboard API
 * Main control center for system-wide monitoring and management
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
    
    if ($method === 'GET') {
        handleGetDashboardData($db);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGetDashboardData($db) {
    try {
        $dashboardData = [
            'system_overview' => getSystemOverview($db),
            'user_statistics' => getUserStatistics($db),
            'resource_statistics' => getResourceStatistics($db),
            'system_health' => getSystemHealth($db),
            'security_status' => getSecurityStatus($db),
            'recent_activities' => getRecentActivities($db),
            'performance_metrics' => getPerformanceMetrics($db),
            'backup_status' => getBackupStatus(),
            'active_sessions' => getActiveSessions($db)
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $dashboardData,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to get dashboard data: ' . $e->getMessage());
    }
}

function getSystemOverview($db) {
    try {
        // Get total counts
        $overview = [];
        
        // Total users by role
        $stmt = $db->query("
            SELECT 
                role,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
            FROM users 
            GROUP BY role
        ");
        $usersByRole = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $overview['users_by_role'] = $usersByRole;
        
        // Total system counts
        $stmt = $db->query("
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'librarian', 'super-admin')) as total_staff,
                (SELECT COUNT(*) FROM books) as total_books,
                (SELECT COUNT(*) FROM book_loans WHERE status = 'active') as active_loans,
                (SELECT COUNT(*) FROM reservations WHERE status = 'active') as active_reservations,
                (SELECT COUNT(*) FROM fines WHERE status = 'pending') as pending_fines
        ");
        $totals = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $overview['totals'] = $totals;
        
        return $overview;
        
    } catch (Exception $e) {
        return [
            'users_by_role' => [],
            'totals' => [
                'total_users' => 0,
                'total_staff' => 0,
                'total_books' => 0,
                'active_loans' => 0,
                'active_reservations' => 0,
                'pending_fines' => 0
            ]
        ];
    }
}

function getUserStatistics($db) {
    try {
        $stats = [];
        
        // User registration trends (last 30 days)
        $stmt = $db->query("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as registrations
            FROM users 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        ");
        $stats['registration_trend'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // User activity (last login)
        $stmt = $db->query("
            SELECT 
                CASE 
                    WHEN last_login >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'today'
                    WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'this_week'
                    WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'this_month'
                    ELSE 'older'
                END as period,
                COUNT(*) as count
            FROM users 
            WHERE last_login IS NOT NULL
            GROUP BY period
        ");
        $stats['activity_breakdown'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top active users
        $stmt = $db->query("
            SELECT 
                u.full_name,
                u.email,
                u.role,
                COUNT(bl.id) as total_loans,
                u.last_login
            FROM users u
            LEFT JOIN book_loans bl ON u.id = bl.user_id
            WHERE u.role = 'user'
            GROUP BY u.id
            ORDER BY total_loans DESC
            LIMIT 10
        ");
        $stats['top_users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $stats;
        
    } catch (Exception $e) {
        return [
            'registration_trend' => [],
            'activity_breakdown' => [],
            'top_users' => []
        ];
    }
}

function getResourceStatistics($db) {
    try {
        $stats = [];
        
        // Book statistics
        $stmt = $db->query("
            SELECT 
                category,
                COUNT(*) as total_books,
                SUM(total_copies) as total_copies,
                SUM(available_copies) as available_copies
            FROM books 
            WHERE status = 'active'
            GROUP BY category
            ORDER BY total_books DESC
        ");
        $stats['books_by_category'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Most borrowed books
        $stmt = $db->query("
            SELECT 
                b.title,
                b.author,
                b.category,
                COUNT(bl.id) as loan_count
            FROM books b
            LEFT JOIN book_loans bl ON b.id = bl.book_id
            GROUP BY b.id
            ORDER BY loan_count DESC
            LIMIT 10
        ");
        $stats['popular_books'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Loan trends (last 30 days)
        $stmt = $db->query("
            SELECT 
                DATE(loan_date) as date,
                COUNT(*) as loans_issued
            FROM book_loans 
            WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(loan_date)
            ORDER BY date DESC
            LIMIT 30
        ");
        $stats['loan_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $stats;
        
    } catch (Exception $e) {
        return [
            'books_by_category' => [],
            'popular_books' => [],
            'loan_trends' => []
        ];
    }
}

function getSystemHealth($db) {
    try {
        $health = [];
        
        // Database health
        $start = microtime(true);
        $stmt = $db->query("SELECT 1");
        $dbResponseTime = round((microtime(true) - $start) * 1000, 2);
        
        $health['database'] = [
            'status' => 'healthy',
            'response_time' => $dbResponseTime,
            'last_check' => date('Y-m-d H:i:s')
        ];
        
        // Storage usage
        $totalSpace = disk_total_space('.');
        $freeSpace = disk_free_space('.');
        $usedSpace = $totalSpace - $freeSpace;
        
        $health['storage'] = [
            'total_gb' => round($totalSpace / (1024**3), 2),
            'used_gb' => round($usedSpace / (1024**3), 2),
            'free_gb' => round($freeSpace / (1024**3), 2),
            'usage_percent' => round(($usedSpace / $totalSpace) * 100, 2)
        ];
        
        // Memory usage
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ini_get('memory_limit');
        $memoryLimitBytes = convertToBytes($memoryLimit);
        
        $health['memory'] = [
            'used_mb' => round($memoryUsage / (1024**2), 2),
            'limit_mb' => round($memoryLimitBytes / (1024**2), 2),
            'usage_percent' => $memoryLimitBytes > 0 ? round(($memoryUsage / $memoryLimitBytes) * 100, 2) : 0
        ];
        
        // System load (if available)
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            $health['cpu'] = [
                'load_1min' => $load[0] ?? 0,
                'load_5min' => $load[1] ?? 0,
                'load_15min' => $load[2] ?? 0,
                'usage_percent' => min(($load[0] ?? 0) * 100, 100)
            ];
        }
        
        return $health;
        
    } catch (Exception $e) {
        return [
            'database' => ['status' => 'unknown', 'response_time' => 0],
            'storage' => ['total_gb' => 0, 'used_gb' => 0, 'free_gb' => 0, 'usage_percent' => 0],
            'memory' => ['used_mb' => 0, 'limit_mb' => 0, 'usage_percent' => 0],
            'cpu' => ['usage_percent' => 0, 'load_1min' => 0]
        ];
    }
}

function getSecurityStatus($db) {
    try {
        $security = [];
        
        // Failed login attempts (last 24 hours)
        $stmt = $db->query("
            SELECT COUNT(*) as failed_attempts
            FROM login_attempts 
            WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $security['failed_logins_24h'] = $result['failed_attempts'] ?? 0;
        
        // Suspended users
        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE status = 'suspended'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $security['suspended_users'] = $result['count'];
        
        // Recent security events
        $stmt = $db->query("
            SELECT 
                'failed_login' as event_type,
                ip_address,
                attempted_at as timestamp,
                'Failed login attempt' as description
            FROM login_attempts 
            WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY attempted_at DESC
            LIMIT 10
        ");
        $security['recent_events'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $security;
        
    } catch (Exception $e) {
        return [
            'failed_logins_24h' => 0,
            'suspended_users' => 0,
            'recent_events' => []
        ];
    }
}

function getRecentActivities($db) {
    try {
        $activities = [];
        
        // Recent user registrations
        $stmt = $db->query("
            SELECT 
                'user_registration' as activity_type,
                full_name as user_name,
                email,
                role,
                created_at as timestamp
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent book additions
        $stmt = $db->query("
            SELECT 
                'book_added' as activity_type,
                title as book_title,
                author,
                category,
                created_at as timestamp
            FROM books 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $bookAdditions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent loans
        $stmt = $db->query("
            SELECT 
                'book_loan' as activity_type,
                u.full_name as user_name,
                b.title as book_title,
                bl.loan_date as timestamp
            FROM book_loans bl
            JOIN users u ON bl.user_id = u.id
            JOIN books b ON bl.book_id = b.id
            WHERE bl.loan_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY bl.loan_date DESC
            LIMIT 5
        ");
        $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Combine and sort all activities
        $allActivities = array_merge($registrations, $bookAdditions, $loans);
        usort($allActivities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        return array_slice($allActivities, 0, 15);
        
    } catch (Exception $e) {
        return []; // Return empty array instead of error object
    }
}

function getPerformanceMetrics($db) {
    try {
        $metrics = [];
        
        // Average response times
        $start = microtime(true);
        $stmt = $db->query("SELECT COUNT(*) FROM users");
        $userQueryTime = microtime(true) - $start;
        
        $start = microtime(true);
        $stmt = $db->query("SELECT COUNT(*) FROM books");
        $bookQueryTime = microtime(true) - $start;
        
        $metrics['query_performance'] = [
            'user_query_ms' => round($userQueryTime * 1000, 2),
            'book_query_ms' => round($bookQueryTime * 1000, 2),
            'average_ms' => round((($userQueryTime + $bookQueryTime) / 2) * 1000, 2)
        ];
        
        // System uptime (approximate)
        $metrics['uptime'] = [
            'server_start' => date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME'] - 3600), // Approximate
            'current_time' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        ];
        
        return $metrics;
        
    } catch (Exception $e) {
        return [
            'query_performance' => ['average_ms' => 0, 'user_query_ms' => 0, 'book_query_ms' => 0],
            'uptime' => ['server_start' => '', 'current_time' => date('Y-m-d H:i:s'), 'php_version' => PHP_VERSION]
        ];
    }
}

function getBackupStatus() {
    try {
        $backupDir = __DIR__ . '/../../backups';
        $status = [
            'backup_enabled' => is_dir($backupDir),
            'last_backup' => null,
            'backup_count' => 0,
            'total_size_mb' => 0
        ];
        
        if (is_dir($backupDir)) {
            $files = glob($backupDir . '/*.sql');
            $status['backup_count'] = count($files);
            
            if (!empty($files)) {
                // Get most recent backup
                $latestFile = max($files);
                $status['last_backup'] = date('Y-m-d H:i:s', filemtime($latestFile));
                
                // Calculate total size
                $totalSize = 0;
                foreach ($files as $file) {
                    $totalSize += filesize($file);
                }
                $status['total_size_mb'] = round($totalSize / (1024**2), 2);
            }
        }
        
        return $status;
        
    } catch (Exception $e) {
        return [
            'backup_enabled' => false,
            'last_backup' => null,
            'backup_count' => 0,
            'total_size_mb' => 0
        ];
    }
}

function getActiveSessions($db) {
    try {
        // This is a simplified version - in a real system you'd track active sessions
        $stmt = $db->query("
            SELECT 
                COUNT(DISTINCT u.id) as online_users
            FROM users u
            WHERE u.last_login >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'online_users' => $result['online_users'] ?? 0,
            'total_sessions' => $result['online_users'] ?? 0, // Simplified
            'last_updated' => date('Y-m-d H:i:s')
        ];
        
    } catch (Exception $e) {
        return [
            'online_users' => 0,
            'total_sessions' => 0,
            'last_updated' => date('Y-m-d H:i:s')
        ];
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
?>