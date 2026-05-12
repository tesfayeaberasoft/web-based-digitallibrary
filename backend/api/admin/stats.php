<?php
/**
 * Get Admin Dashboard Statistics
 * GET /api/admin/stats
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins can access
    if (!in_array($decoded['role'], ['admin', 'super-admin'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // === OVERVIEW STATS ===
    
    // Total users (all roles)
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $total_users = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Users by role
    $stmt = $db->prepare("
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    ");
    $stmt->execute();
    $users_by_role = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Total books
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM books");
    $stmt->execute();
    $total_books = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Active loans
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM book_loans WHERE status = 'active'");
    $stmt->execute();
    $active_loans = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Total revenue (fines collected)
    $stmt = $db->prepare("SELECT SUM(paid_amount) as total FROM fines WHERE status = 'paid'");
    $stmt->execute();
    $total_revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // Outstanding fines
    $stmt = $db->prepare("SELECT SUM(amount - paid_amount) as total FROM fines WHERE status != 'paid'");
    $stmt->execute();
    $outstanding_fines = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // === MONTHLY TRENDS ===
    
    // Monthly circulation (last 6 months)
    $stmt = $db->prepare("
        SELECT 
            DATE_FORMAT(loan_date, '%Y-%m') as month,
            COUNT(*) as loans
        FROM book_loans 
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(loan_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
    ");
    $stmt->execute();
    $monthly_circulation = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    // Monthly revenue (last 6 months)
    $stmt = $db->prepare("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(paid_amount) as revenue
        FROM fines 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND status = 'paid'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
    ");
    $stmt->execute();
    $monthly_revenue = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    // === CATEGORY DISTRIBUTION ===
    
    $stmt = $db->prepare("
        SELECT 
            c.name as category,
            COUNT(b.id) as count,
            ROUND((COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM books)), 1) as percentage
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id
        GROUP BY c.id, c.name
        ORDER BY count DESC
    ");
    $stmt->execute();
    $category_distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // === RECENT ACTIVITIES ===
    
    $stmt = $db->prepare("
        SELECT 
            'loan' as type,
            u.full_name as user_name,
            b.title as book_title,
            bl.loan_date as activity_date,
            'Borrowed a book' as action
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE bl.loan_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        
        UNION ALL
        
        SELECT 
            'return' as type,
            u.full_name as user_name,
            b.title as book_title,
            bl.return_date as activity_date,
            'Returned a book' as action
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE bl.return_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND bl.status = 'returned'
        
        UNION ALL
        
        SELECT 
            'registration' as type,
            u.full_name as user_name,
            NULL as book_title,
            u.created_at as activity_date,
            'Registered account' as action
        FROM users u
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND u.role = 'user'
        
        ORDER BY activity_date DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recent_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // === TODAY'S STATS ===
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE DATE(loan_date) = CURDATE()");
    $stmt->execute();
    $today_loans = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE DATE(return_date) = CURDATE()");
    $stmt->execute();
    $today_returns = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $today_registrations = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $stmt = $db->prepare("SELECT SUM(paid_amount) as total FROM fines WHERE DATE(updated_at) = CURDATE() AND status = 'paid'");
    $stmt->execute();
    $today_revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // === SYSTEM HEALTH ===
    
    // Overdue books
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM book_loans 
        WHERE status = 'active' AND due_date < CURDATE()
    ");
    $stmt->execute();
    $overdue_books = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Pending reservations
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_reservations WHERE status = 'pending'");
    $stmt->execute();
    $pending_reservations = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // === ADVANCED ANALYTICS ===
    
    // User engagement metrics
    $stmt = $db->prepare("
        SELECT 
            AVG(books_per_user) as avg_books_per_user,
            MAX(books_per_user) as max_books_per_user
        FROM (
            SELECT user_id, COUNT(*) as books_per_user
            FROM book_loans 
            WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY user_id
        ) as user_stats
    ");
    $stmt->execute();
    $user_engagement = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Popular books (most borrowed in last 30 days)
    $stmt = $db->prepare("
        SELECT 
            b.title,
            b.author,
            c.name as category,
            COUNT(bl.id) as loan_count
        FROM books b
        JOIN book_loans bl ON b.id = bl.book_id
        JOIN categories c ON b.category_id = c.id
        WHERE bl.loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY b.id, b.title, b.author, c.name
        ORDER BY loan_count DESC
        LIMIT 10
    ");
    $stmt->execute();
    $popular_books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Peak hours analysis
    $stmt = $db->prepare("
        SELECT 
            HOUR(loan_date) as hour,
            COUNT(*) as loan_count
        FROM book_loans 
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY HOUR(loan_date)
        ORDER BY hour
    ");
    $stmt->execute();
    $peak_hours = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Weekly patterns
    $stmt = $db->prepare("
        SELECT 
            DAYNAME(loan_date) as day_name,
            DAYOFWEEK(loan_date) as day_number,
            COUNT(*) as loan_count
        FROM book_loans 
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DAYOFWEEK(loan_date), DAYNAME(loan_date)
        ORDER BY day_number
    ");
    $stmt->execute();
    $weekly_patterns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return rate analysis
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_books,
            COUNT(CASE WHEN status = 'active' AND due_date >= CURDATE() THEN 1 END) as active_books,
            COUNT(CASE WHEN status = 'active' AND due_date < CURDATE() THEN 1 END) as overdue_books,
            COUNT(*) as total_loans
        FROM book_loans 
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $return_analysis = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // User satisfaction metrics (based on return patterns)
    $stmt = $db->prepare("
        SELECT 
            AVG(DATEDIFF(return_date, loan_date)) as avg_loan_duration,
            COUNT(CASE WHEN return_date <= due_date THEN 1 END) as on_time_returns,
            COUNT(CASE WHEN return_date > due_date THEN 1 END) as late_returns,
            COUNT(*) as total_returns
        FROM book_loans 
        WHERE status = 'returned' 
        AND return_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $satisfaction_metrics = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Collection utilization
    $stmt = $db->prepare("
        SELECT 
            COUNT(DISTINCT bl.book_id) as borrowed_books,
            COUNT(DISTINCT b.id) as total_books,
            ROUND((COUNT(DISTINCT bl.book_id) * 100.0 / COUNT(DISTINCT b.id)), 1) as utilization_rate
        FROM books b
        LEFT JOIN book_loans bl ON b.id = bl.book_id 
        AND bl.loan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $collection_utilization = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Revenue breakdown by fine types
    $stmt = $db->prepare("
        SELECT 
            fine_type,
            COUNT(*) as fine_count,
            SUM(amount) as total_amount,
            SUM(paid_amount) as paid_amount,
            AVG(amount) as avg_fine_amount
        FROM fines 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY fine_type
        ORDER BY total_amount DESC
    ");
    $stmt->execute();
    $revenue_breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Monthly comparison (current vs previous month) - separate queries to avoid ambiguity
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as current_month_loans,
            COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                       AND DATE(loan_date) < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as previous_month_loans
        FROM book_loans
    ");
    $stmt->execute();
    $loan_comparison = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN DATE(u.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND u.role = 'user' THEN 1 END) as current_month_users,
            COUNT(CASE WHEN DATE(u.created_at) >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                       AND DATE(u.created_at) < DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND u.role = 'user' THEN 1 END) as previous_month_users
        FROM users u
    ");
    $stmt->execute();
    $user_comparison = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $monthly_comparison = array_merge($loan_comparison, $user_comparison);
    
    // Calculate growth percentages (compared to last month)
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as current_month,
            COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                       AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as last_month
        FROM users WHERE role = 'user'
    ");
    $stmt->execute();
    $user_growth = $stmt->fetch(PDO::FETCH_ASSOC);
    $user_growth_percentage = $user_growth['last_month'] > 0 
        ? round((($user_growth['current_month'] - $user_growth['last_month']) / $user_growth['last_month']) * 100, 1)
        : 0;
    
    $stmt = $db->prepare("
        SELECT 
            COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as current_month,
            COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                       AND DATE(loan_date) < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as last_month
        FROM book_loans
    ");
    $stmt->execute();
    $loan_growth = $stmt->fetch(PDO::FETCH_ASSOC);
    $loan_growth_percentage = $loan_growth['last_month'] > 0 
        ? round((($loan_growth['current_month'] - $loan_growth['last_month']) / $loan_growth['last_month']) * 100, 1)
        : 0;
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'overview' => [
                'total_users' => (int)$total_users,
                'total_books' => (int)$total_books,
                'active_loans' => (int)$active_loans,
                'total_revenue' => (float)$total_revenue,
                'outstanding_fines' => (float)$outstanding_fines,
                'overdue_books' => (int)$overdue_books,
                'pending_reservations' => (int)$pending_reservations,
                'user_growth_percentage' => (float)$user_growth_percentage,
                'loan_growth_percentage' => (float)$loan_growth_percentage
            ],
            'users_by_role' => $users_by_role,
            'monthly_circulation' => $monthly_circulation,
            'monthly_revenue' => $monthly_revenue,
            'category_distribution' => $category_distribution,
            'recent_activities' => $recent_activities,
            'today' => [
                'loans' => (int)$today_loans,
                'returns' => (int)$today_returns,
                'registrations' => (int)$today_registrations,
                'revenue' => (float)$today_revenue
            ],
            'analytics' => [
                'user_engagement' => [
                    'avg_books_per_user' => (float)($user_engagement['avg_books_per_user'] ?? 0),
                    'max_books_per_user' => (int)($user_engagement['max_books_per_user'] ?? 0)
                ],
                'popular_books' => $popular_books,
                'peak_hours' => $peak_hours,
                'weekly_patterns' => $weekly_patterns,
                'return_analysis' => [
                    'returned_books' => (int)$return_analysis['returned_books'],
                    'active_books' => (int)$return_analysis['active_books'],
                    'overdue_books' => (int)$return_analysis['overdue_books'],
                    'total_loans' => (int)$return_analysis['total_loans'],
                    'return_rate' => $return_analysis['total_loans'] > 0 
                        ? round(($return_analysis['returned_books'] / $return_analysis['total_loans']) * 100, 1)
                        : 0
                ],
                'satisfaction_metrics' => [
                    'avg_loan_duration' => (float)($satisfaction_metrics['avg_loan_duration'] ?? 0),
                    'on_time_returns' => (int)$satisfaction_metrics['on_time_returns'],
                    'late_returns' => (int)$satisfaction_metrics['late_returns'],
                    'total_returns' => (int)$satisfaction_metrics['total_returns'],
                    'on_time_rate' => $satisfaction_metrics['total_returns'] > 0 
                        ? round(($satisfaction_metrics['on_time_returns'] / $satisfaction_metrics['total_returns']) * 100, 1)
                        : 0
                ],
                'collection_utilization' => [
                    'borrowed_books' => (int)$collection_utilization['borrowed_books'],
                    'total_books' => (int)$collection_utilization['total_books'],
                    'utilization_rate' => (float)$collection_utilization['utilization_rate']
                ],
                'revenue_breakdown' => $revenue_breakdown,
                'monthly_comparison' => [
                    'loans' => [
                        'current' => (int)$loan_comparison['current_month_loans'],
                        'previous' => (int)$loan_comparison['previous_month_loans'],
                        'change' => $loan_comparison['previous_month_loans'] > 0 
                            ? round((($loan_comparison['current_month_loans'] - $loan_comparison['previous_month_loans']) / $loan_comparison['previous_month_loans']) * 100, 1)
                            : 0
                    ],
                    'users' => [
                        'current' => (int)$user_comparison['current_month_users'],
                        'previous' => (int)$user_comparison['previous_month_users'],
                        'change' => $user_comparison['previous_month_users'] > 0 
                            ? round((($user_comparison['current_month_users'] - $user_comparison['previous_month_users']) / $user_comparison['previous_month_users']) * 100, 1)
                            : 0
                    ]
                ]
            ]
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
