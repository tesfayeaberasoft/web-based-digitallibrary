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
    if ($decoded['role'] !== 'admin') {
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
            ]
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>