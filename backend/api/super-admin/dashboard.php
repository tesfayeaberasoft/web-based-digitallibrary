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
        $overview = [];
        
        // Get total counts with more detailed information
        $stmt = $db->query("
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'user') as regular_users,
                (SELECT COUNT(*) FROM users WHERE role = 'librarian') as librarians,
                (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
                (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'librarian', 'super-admin')) as total_staff,
                (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
                (SELECT COUNT(*) FROM users WHERE status = 'suspended') as suspended_users,
                (SELECT COUNT(*) FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as users_today,
                (SELECT COUNT(*) FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as users_this_week,
                (SELECT COUNT(*) FROM books) as total_books,
                (SELECT COUNT(*) FROM books WHERE status = 'active') as active_books,
                (SELECT SUM(total_copies) FROM books) as total_book_copies,
                (SELECT SUM(available_copies) FROM books) as available_book_copies,
                (SELECT COUNT(*) FROM book_loans WHERE status = 'active') as active_loans,
                (SELECT COUNT(*) FROM book_loans WHERE status = 'overdue') as overdue_loans,
                (SELECT COUNT(*) FROM book_loans WHERE return_date IS NOT NULL) as total_returns,
                (SELECT COUNT(*) FROM book_reservations WHERE status = 'pending') as pending_reservations,
                (SELECT COUNT(*) FROM book_reservations WHERE status = 'available') as available_reservations,
                (SELECT COUNT(*) FROM fines WHERE status = 'pending') as pending_fines,
                (SELECT COUNT(*) FROM fines WHERE status = 'paid') as paid_fines,
                (SELECT CAST(COALESCE(SUM(amount), 0) AS DECIMAL(10,2)) FROM fines WHERE status = 'pending') as total_pending_fine_amount,
                (SELECT CAST(COALESCE(SUM(paid_amount), 0) AS DECIMAL(10,2)) FROM fines WHERE status = 'paid') as total_collected_fines,
                (SELECT COUNT(*) FROM categories) as total_categories,
                (SELECT COUNT(*) FROM notifications WHERE status = 'unread') as unread_notifications,
                (SELECT COUNT(*) FROM book_reviews) as total_reviews,
                (SELECT COALESCE(AVG(rating), 0) FROM book_reviews) as average_rating
        ");
        $totals = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calculate additional metrics
        $totals['borrowed_percentage'] = $totals['total_book_copies'] > 0 
            ? round((($totals['total_book_copies'] - $totals['available_book_copies']) / $totals['total_book_copies']) * 100, 2)
            : 0;
        
        $totals['user_engagement_rate'] = $totals['total_users'] > 0
            ? round(($totals['users_this_week'] / $totals['total_users']) * 100, 2)
            : 0;
        
        // Convert numeric strings to proper numbers
        $totals['total_pending_fine_amount'] = floatval($totals['total_pending_fine_amount']);
        $totals['total_collected_fines'] = floatval($totals['total_collected_fines']);
        $totals['average_rating'] = floatval($totals['average_rating']);
        
        $overview['totals'] = $totals;
        
        // Users by role with detailed breakdown
        $stmt = $db->query("
            SELECT 
                role,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_count,
                SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_this_week
            FROM users 
            GROUP BY role
            ORDER BY count DESC
        ");
        $overview['users_by_role'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Books by category with availability
        $stmt = $db->query("
            SELECT 
                c.name as category,
                c.color_code,
                COUNT(b.id) as total_books,
                SUM(b.total_copies) as total_copies,
                SUM(b.available_copies) as available_copies,
                ROUND((SUM(b.total_copies) - SUM(b.available_copies)) / SUM(b.total_copies) * 100, 2) as utilization_rate
            FROM categories c
            LEFT JOIN books b ON c.id = b.category_id AND b.status = 'active'
            GROUP BY c.id, c.name, c.color_code
            ORDER BY total_books DESC
            LIMIT 10
        ");
        $overview['books_by_category'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent activity summary (last 7 days)
        $stmt = $db->query("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_users
            FROM users 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        ");
        $overview['recent_user_registrations'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Loan activity (last 7 days)
        $stmt = $db->query("
            SELECT 
                DATE(loan_date) as date,
                COUNT(*) as loans_issued,
                SUM(CASE WHEN return_date IS NOT NULL THEN 1 ELSE 0 END) as books_returned
            FROM book_loans 
            WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(loan_date)
            ORDER BY date DESC
        ");
        $overview['recent_loan_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top borrowed books
        $stmt = $db->query("
            SELECT 
                b.title,
                b.author,
                b.isbn,
                c.name as category,
                COUNT(bl.id) as borrow_count,
                b.available_copies,
                b.total_copies
            FROM books b
            LEFT JOIN book_loans bl ON b.id = bl.book_id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.status = 'active'
            GROUP BY b.id
            ORDER BY borrow_count DESC
            LIMIT 10
        ");
        $overview['top_borrowed_books'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Most active users
        $stmt = $db->query("
            SELECT 
                u.full_name,
                u.email,
                u.user_id,
                COUNT(bl.id) as total_loans,
                SUM(CASE WHEN bl.status = 'active' THEN 1 ELSE 0 END) as current_loans,
                u.last_login
            FROM users u
            LEFT JOIN book_loans bl ON u.id = bl.user_id
            WHERE u.role = 'user' AND u.status = 'active'
            GROUP BY u.id
            ORDER BY total_loans DESC
            LIMIT 10
        ");
        $overview['most_active_users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fine statistics
        $stmt = $db->query("
            SELECT 
                fine_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END) as collected_amount
            FROM fines
            GROUP BY fine_type
            ORDER BY total_amount DESC
        ");
        $overview['fine_statistics'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Monthly trends (last 12 months)
        $stmt = $db->query("
            SELECT 
                DATE_FORMAT(loan_date, '%Y-%m') as month,
                COUNT(*) as loans,
                COUNT(DISTINCT user_id) as unique_users
            FROM book_loans
            WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(loan_date, '%Y-%m')
            ORDER BY month DESC
        ");
        $overview['monthly_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // System health indicators
        $overview['health_indicators'] = [
            'overdue_rate' => $totals['active_loans'] > 0 
                ? round(($totals['overdue_loans'] / $totals['active_loans']) * 100, 2)
                : 0,
            'reservation_fulfillment_rate' => ($totals['pending_reservations'] + $totals['available_reservations']) > 0
                ? round(($totals['available_reservations'] / ($totals['pending_reservations'] + $totals['available_reservations'])) * 100, 2)
                : 0,
            'fine_collection_rate' => ($totals['total_pending_fine_amount'] + $totals['total_collected_fines']) > 0
                ? round(($totals['total_collected_fines'] / ($totals['total_pending_fine_amount'] + $totals['total_collected_fines'])) * 100, 2)
                : 0,
            'book_availability_rate' => $totals['total_book_copies'] > 0
                ? round(($totals['available_book_copies'] / $totals['total_book_copies']) * 100, 2)
                : 0
        ];
        
        return $overview;
        
    } catch (Exception $e) {
        error_log("Error in getSystemOverview: " . $e->getMessage());
        return [
            'users_by_role' => [],
            'books_by_category' => [],
            'totals' => [
                'total_users' => 0,
                'total_staff' => 0,
                'total_books' => 0,
                'active_loans' => 0,
                'pending_reservations' => 0,
                'pending_fines' => 0
            ],
            'health_indicators' => [
                'overdue_rate' => 0,
                'reservation_fulfillment_rate' => 0,
                'fine_collection_rate' => 0,
                'book_availability_rate' => 0
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
        require_once __DIR__ . '/../../utils/security-helper.php';
        $settings = getSuperAdminSecuritySettings($db);
        $threshold = (int) ($settings['failed_login_threshold'] ?? 10);
        $failed24 = getFailedLoginSummary($db, 24);
        $suspicious = getSuspiciousIpRows($db, 24, $threshold);
        $inactiveAdmins = getInactiveAdminAccounts($db);
        $blockedIps = getBlockedIpList($db);

        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE status = 'suspended'");
        $suspended = (int) ($stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0);

        return [
            'failed_logins_24h' => $failed24['total_failed'],
            'failed_logins_7d' => getFailedLoginSummary($db, 168)['total_failed'],
            'failed_login_threshold' => $threshold,
            'suspicious_ips' => count($suspicious),
            'inactive_admins' => count($inactiveAdmins),
            'blocked_ips' => count($blockedIps),
            'suspended_users' => $suspended,
            'recent_events' => getRecentLoginAttempts($db, 10),
            'security_panel_url' => '/super-admin/security',
        ];
    } catch (Exception $e) {
        return [
            'failed_logins_24h' => 0,
            'failed_logins_7d' => 0,
            'failed_login_threshold' => 10,
            'suspicious_ips' => 0,
            'inactive_admins' => 0,
            'blocked_ips' => 0,
            'suspended_users' => 0,
            'recent_events' => [],
            'security_panel_url' => '/super-admin/security',
        ];
    }
}

function getRecentActivities($db) {
    try {
        $activities = [];
        
        // Recent user registrations (last 90 days or all if less)
        try {
            $stmt = $db->query("
                SELECT 
                    'User Registration' as action,
                    full_name as user_name,
                    CONCAT('New ', role, ' account created: ', email) as details,
                    'success' as status,
                    created_at as timestamp
                FROM users 
                ORDER BY created_at DESC
                LIMIT 10
            ");
            $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Registrations count: " . count($registrations));
        } catch (Exception $e) {
            error_log("Error fetching registrations: " . $e->getMessage());
            $registrations = [];
        }
        
        // Recent book additions (all books)
        try {
            $stmt = $db->query("
                SELECT 
                    'Book Added' as action,
                    'System' as user_name,
                    CONCAT('\"', title, '\" by ', author, ' (', COALESCE(c.name, category), ')') as details,
                    'success' as status,
                    b.created_at as timestamp
                FROM books b
                LEFT JOIN categories c ON b.category_id = c.id
                ORDER BY b.created_at DESC
                LIMIT 10
            ");
            $bookAdditions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Book additions count: " . count($bookAdditions));
        } catch (Exception $e) {
            error_log("Error fetching book additions: " . $e->getMessage());
            $bookAdditions = [];
        }
        
        // Recent loans (all loans)
        try {
            $stmt = $db->query("
                SELECT 
                    'Book Issued' as action,
                    u.full_name as user_name,
                    CONCAT('Borrowed \"', b.title, '\"') as details,
                    CASE 
                        WHEN bl.status = 'active' THEN 'success'
                        WHEN bl.status = 'overdue' THEN 'warning'
                        ELSE 'info'
                    END as status,
                    bl.created_at as timestamp
                FROM book_loans bl
                JOIN users u ON bl.user_id = u.id
                JOIN books b ON bl.book_id = b.id
                ORDER BY bl.created_at DESC
                LIMIT 10
            ");
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Loans count: " . count($loans));
        } catch (Exception $e) {
            error_log("Error fetching loans: " . $e->getMessage());
            $loans = [];
        }
        
        // Recent returns (all returns)
        try {
            $stmt = $db->query("
                SELECT 
                    'Book Returned' as action,
                    u.full_name as user_name,
                    CONCAT('Returned \"', b.title, '\"') as details,
                    CASE 
                        WHEN bl.return_date <= bl.due_date THEN 'success'
                        WHEN bl.return_date > bl.due_date THEN 'warning'
                        ELSE 'info'
                    END as status,
                    bl.return_date as timestamp
                FROM book_loans bl
                JOIN users u ON bl.user_id = u.id
                JOIN books b ON bl.book_id = b.id
                WHERE bl.return_date IS NOT NULL
                ORDER BY bl.return_date DESC
                LIMIT 10
            ");
            $returns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Returns count: " . count($returns));
        } catch (Exception $e) {
            error_log("Error fetching returns: " . $e->getMessage());
            $returns = [];
        }
        
        // Recent reservations (all reservations)
        try {
            $stmt = $db->query("
                SELECT 
                    'Book Reserved' as action,
                    u.full_name as user_name,
                    CONCAT('Reserved \"', b.title, '\"') as details,
                    CASE 
                        WHEN br.status = 'pending' THEN 'info'
                        WHEN br.status = 'available' THEN 'success'
                        WHEN br.status = 'cancelled' THEN 'error'
                        ELSE 'info'
                    END as status,
                    br.reservation_date as timestamp
                FROM book_reservations br
                JOIN users u ON br.user_id = u.id
                JOIN books b ON br.book_id = b.id
                ORDER BY br.reservation_date DESC
                LIMIT 10
            ");
            $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Reservations count: " . count($reservations));
        } catch (Exception $e) {
            error_log("Error fetching reservations: " . $e->getMessage());
            $reservations = [];
        }
        
        // Recent fine payments (all payments)
        try {
            $stmt = $db->query("
                SELECT 
                    'Fine Paid' as action,
                    u.full_name as user_name,
                    CONCAT('Paid fine: $', COALESCE(f.paid_amount, 0), ' (', f.fine_type, ')') as details,
                    'success' as status,
                    f.paid_date as timestamp
                FROM fines f
                JOIN users u ON f.user_id = u.id
                WHERE f.status = 'paid' 
                AND f.paid_date IS NOT NULL
                ORDER BY f.paid_date DESC
                LIMIT 10
            ");
            $finePayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Fine payments count: " . count($finePayments));
        } catch (Exception $e) {
            error_log("Error fetching fine payments: " . $e->getMessage());
            $finePayments = [];
        }
        
        // Recent user logins (if login_attempts table exists)
        try {
            $stmt = $db->query("
                SELECT 
                    CASE WHEN success = 1 THEN 'User Login' ELSE 'Failed Login' END as action,
                    COALESCE(u.full_name, 'Unknown User') as user_name,
                    CONCAT('Login from IP: ', la.ip_address) as details,
                    CASE WHEN success = 1 THEN 'success' ELSE 'error' END as status,
                    la.attempted_at as timestamp
                FROM login_attempts la
                LEFT JOIN users u ON la.user_id = u.id
                ORDER BY la.attempted_at DESC
                LIMIT 10
            ");
            $logins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Logins count: " . count($logins));
        } catch (Exception $e) {
            error_log("Error fetching logins (table may not exist): " . $e->getMessage());
            $logins = [];
        }
        
        // Combine and sort all activities
        $allActivities = array_merge(
            $registrations, 
            $bookAdditions, 
            $loans, 
            $returns, 
            $reservations, 
            $finePayments,
            $logins
        );
        
        // Filter out activities with null timestamps
        $allActivities = array_filter($allActivities, function($activity) {
            return !empty($activity['timestamp']);
        });
        
        usort($allActivities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        $result = array_slice($allActivities, 0, 50);
        error_log("Total activities returned: " . count($result));
        
        return $result;
        
    } catch (Exception $e) {
        error_log("Error in getRecentActivities: " . $e->getMessage());
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