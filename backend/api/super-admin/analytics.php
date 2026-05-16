<?php
/**
 * Super Admin Analytics API
 * GET /api/super-admin/analytics?days=30
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();

    if ($decoded['role'] !== 'super-admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Super admin access required']);
        exit;
    }

    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();

    $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
    $days = max(7, min(365, $days));

    // === OVERVIEW ===
    $overview = $db->query("
        SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'user') as members,
            (SELECT COUNT(*) FROM users WHERE role = 'librarian') as librarians,
            (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
            (SELECT COUNT(*) FROM users WHERE role = 'super-admin') as super_admins,
            (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
            (SELECT COUNT(*) FROM users WHERE status = 'suspended') as suspended_users,
            (SELECT COUNT(*) FROM books) as total_books,
            (SELECT COALESCE(SUM(total_copies), 0) FROM books) as total_copies,
            (SELECT COALESCE(SUM(available_copies), 0) FROM books) as available_copies,
            (SELECT COUNT(*) FROM book_loans WHERE status = 'active') as active_loans,
            (SELECT COUNT(*) FROM book_loans WHERE status = 'active' AND due_date < CURDATE()) as overdue_loans,
            (SELECT COALESCE(SUM(paid_amount), 0) FROM fines WHERE status = 'paid') as total_revenue,
            (SELECT COALESCE(SUM(amount - paid_amount), 0) FROM fines WHERE status != 'paid') as outstanding_fines,
            (SELECT COUNT(*) FROM book_reservations WHERE status = 'pending') as pending_reservations
    ")->fetch(PDO::FETCH_ASSOC);

    $overview['borrow_rate'] = $overview['total_copies'] > 0
        ? round((($overview['total_copies'] - $overview['available_copies']) / $overview['total_copies']) * 100, 1)
        : 0;

    // Today's activity
    $today = $db->query("
        SELECT
            (SELECT COUNT(*) FROM book_loans WHERE DATE(loan_date) = CURDATE()) as loans,
            (SELECT COUNT(*) FROM book_loans WHERE DATE(return_date) = CURDATE()) as returns,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as registrations,
            (SELECT COALESCE(SUM(paid_amount), 0) FROM fines WHERE DATE(updated_at) = CURDATE() AND status = 'paid') as revenue
    ")->fetch(PDO::FETCH_ASSOC);

    // Users by role
    $usersByRole = $db->query("
        SELECT role, COUNT(*) as count,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
        FROM users GROUP BY role ORDER BY count DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // User status distribution
    $userStatus = $db->query("
        SELECT status, COUNT(*) as count FROM users GROUP BY status
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Daily loan trend
    $stmt = $db->prepare("
        SELECT DATE(loan_date) as date, COUNT(*) as loans
        FROM book_loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(loan_date)
        ORDER BY date ASC
    ");
    $stmt->execute([$days]);
    $dailyLoans = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Daily returns trend
    $stmt = $db->prepare("
        SELECT DATE(return_date) as date, COUNT(*) as returns
        FROM book_loans
        WHERE return_date IS NOT NULL
        AND return_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(return_date)
        ORDER BY date ASC
    ");
    $stmt->execute([$days]);
    $dailyReturns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Daily registrations
    $stmt = $db->prepare("
        SELECT DATE(created_at) as date, COUNT(*) as registrations
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$days]);
    $dailyRegistrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Monthly circulation (6 months)
    $monthlyCirculation = $db->query("
        SELECT DATE_FORMAT(loan_date, '%Y-%m') as month, COUNT(*) as loans
        FROM book_loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(loan_date, '%Y-%m')
        ORDER BY month ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Monthly revenue
    $monthlyRevenue = $db->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(paid_amount), 0) as revenue
        FROM fines
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND status = 'paid'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Category distribution
    $categoryDistribution = $db->query("
        SELECT c.name as category, c.color_code, COUNT(b.id) as count,
            ROUND(COUNT(b.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM books), 0), 1) as percentage
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id
        GROUP BY c.id, c.name, c.color_code
        ORDER BY count DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Period analytics (uses $days)
    $stmt = $db->prepare("
        SELECT HOUR(loan_date) as hour, COUNT(*) as loan_count
        FROM book_loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY HOUR(loan_date) ORDER BY hour
    ");
    $stmt->execute([$days]);
    $peakHours = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("
        SELECT DAYNAME(loan_date) as day_name, DAYOFWEEK(loan_date) as day_number, COUNT(*) as loan_count
        FROM book_loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DAYOFWEEK(loan_date), DAYNAME(loan_date)
        ORDER BY day_number
    ");
    $stmt->execute([$days]);
    $weeklyPatterns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("
        SELECT b.title, b.author, c.name as category, COUNT(bl.id) as loan_count
        FROM books b
        JOIN book_loans bl ON b.id = bl.book_id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE bl.loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY b.id, b.title, b.author, c.name
        ORDER BY loan_count DESC LIMIT 15
    ");
    $stmt->execute([$days]);
    $popularBooks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("
        SELECT u.full_name, u.email, COUNT(bl.id) as loan_count
        FROM users u
        JOIN book_loans bl ON u.id = bl.user_id
        WHERE bl.loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND u.role = 'user'
        GROUP BY u.id, u.full_name, u.email
        ORDER BY loan_count DESC LIMIT 10
    ");
    $stmt->execute([$days]);
    $topMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("
        SELECT
            COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_books,
            COUNT(CASE WHEN status = 'active' AND due_date >= CURDATE() THEN 1 END) as active_on_time,
            COUNT(CASE WHEN status = 'active' AND due_date < CURDATE() THEN 1 END) as overdue_books,
            COUNT(*) as total_loans
        FROM book_loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ");
    $stmt->execute([$days]);
    $returnAnalysis = $stmt->fetch(PDO::FETCH_ASSOC);
    $returnAnalysis['return_rate'] = $returnAnalysis['total_loans'] > 0
        ? round(($returnAnalysis['returned_books'] / $returnAnalysis['total_loans']) * 100, 1) : 0;

    $stmt = $db->prepare("
        SELECT AVG(DATEDIFF(return_date, loan_date)) as avg_loan_duration,
            COUNT(CASE WHEN return_date <= due_date THEN 1 END) as on_time_returns,
            COUNT(CASE WHEN return_date > due_date THEN 1 END) as late_returns,
            COUNT(*) as total_returns
        FROM book_loans
        WHERE status = 'returned' AND return_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ");
    $stmt->execute([$days]);
    $satisfaction = $stmt->fetch(PDO::FETCH_ASSOC);
    $satisfaction['on_time_rate'] = $satisfaction['total_returns'] > 0
        ? round(($satisfaction['on_time_returns'] / $satisfaction['total_returns']) * 100, 1) : 0;

    $stmt = $db->prepare("
        SELECT fine_type, COUNT(*) as fine_count,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(SUM(paid_amount), 0) as paid_amount
        FROM fines
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY fine_type ORDER BY total_amount DESC
    ");
    $stmt->execute([$days]);
    $revenueBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $db->prepare("
        SELECT COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY) THEN 1 END) as current_period,
            COUNT(CASE WHEN DATE(loan_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                AND DATE(loan_date) < DATE_SUB(CURDATE(), INTERVAL ? DAY) THEN 1 END) as previous_period
        FROM book_loans
    ");
    $stmt->execute([$days, $days * 2, $days]);
    $loanComp = $stmt->fetch(PDO::FETCH_ASSOC);
    $loanChange = $loanComp['previous_period'] > 0
        ? round((($loanComp['current_period'] - $loanComp['previous_period']) / $loanComp['previous_period']) * 100, 1) : 0;

    $stmt = $db->prepare("
        SELECT COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY) THEN 1 END) as current_period,
            COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL ? DAY) THEN 1 END) as previous_period
        FROM users WHERE role = 'user'
    ");
    $stmt->execute([$days, $days * 2, $days]);
    $userComp = $stmt->fetch(PDO::FETCH_ASSOC);
    $userChange = $userComp['previous_period'] > 0
        ? round((($userComp['current_period'] - $userComp['previous_period']) / $userComp['previous_period']) * 100, 1) : 0;

    // Collection utilization (period)
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT bl.book_id) as borrowed_books,
            (SELECT COUNT(*) FROM books) as total_books,
            ROUND(COUNT(DISTINCT bl.book_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM books), 0), 1) as utilization_rate
        FROM book_loans bl
        WHERE bl.loan_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ");
    $stmt->execute([$days]);
    $collectionUtil = $stmt->fetch(PDO::FETCH_ASSOC);

    // Recent activities (48h)
    $recentActivities = $db->query("
        SELECT 'loan' as type, u.full_name as user_name, b.title as book_title,
            bl.loan_date as activity_date, 'Borrowed a book' as action
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE bl.loan_date >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
        UNION ALL
        SELECT 'return', u.full_name, b.title, bl.return_date, 'Returned a book'
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE bl.return_date >= DATE_SUB(NOW(), INTERVAL 48 HOUR) AND bl.status = 'returned'
        UNION ALL
        SELECT 'registration', u.full_name, NULL, u.created_at, 'New account'
        FROM users u
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
        ORDER BY activity_date DESC LIMIT 20
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Merge daily trends for chart
    $dateMap = [];
    foreach ($dailyLoans as $row) {
        $dateMap[$row['date']] = ['date' => $row['date'], 'loans' => (int) $row['loans'], 'returns' => 0, 'registrations' => 0];
    }
    foreach ($dailyReturns as $row) {
        if (!isset($dateMap[$row['date']])) {
            $dateMap[$row['date']] = ['date' => $row['date'], 'loans' => 0, 'returns' => 0, 'registrations' => 0];
        }
        $dateMap[$row['date']]['returns'] = (int) $row['returns'];
    }
    foreach ($dailyRegistrations as $row) {
        if (!isset($dateMap[$row['date']])) {
            $dateMap[$row['date']] = ['date' => $row['date'], 'loans' => 0, 'returns' => 0, 'registrations' => 0];
        }
        $dateMap[$row['date']]['registrations'] = (int) $row['registrations'];
    }
    ksort($dateMap);
    $dailyTrend = array_values($dateMap);

    echo json_encode([
        'success' => true,
        'period_days' => $days,
        'stats' => [
            'overview' => array_map(function ($v) {
                return is_numeric($v) ? (strpos((string) $v, '.') !== false ? (float) $v : (int) $v) : $v;
            }, $overview),
            'today' => [
                'loans' => (int) $today['loans'],
                'returns' => (int) $today['returns'],
                'registrations' => (int) $today['registrations'],
                'revenue' => (float) $today['revenue']
            ],
            'users_by_role' => $usersByRole,
            'user_status' => $userStatus,
            'monthly_circulation' => $monthlyCirculation,
            'monthly_revenue' => array_map(function ($r) {
                $r['revenue'] = (float) $r['revenue'];
                return $r;
            }, $monthlyRevenue),
            'category_distribution' => $categoryDistribution,
            'daily_trend' => $dailyTrend,
            'recent_activities' => $recentActivities,
            'top_members' => $topMembers,
            'analytics' => [
                'peak_hours' => $peakHours,
                'weekly_patterns' => $weeklyPatterns,
                'popular_books' => $popularBooks,
                'return_analysis' => $returnAnalysis,
                'satisfaction_metrics' => $satisfaction,
                'collection_utilization' => $collectionUtil,
                'revenue_breakdown' => $revenueBreakdown,
                'monthly_comparison' => [
                    'loans' => ['current' => (int) $loanComp['current_period'], 'previous' => (int) $loanComp['previous_period'], 'change' => $loanChange],
                    'users' => ['current' => (int) $userComp['current_period'], 'previous' => (int) $userComp['previous_period'], 'change' => $userChange]
                ]
            ]
        ],
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
