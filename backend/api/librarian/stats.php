<?php
/**
 * Get Librarian Statistics
 * GET /api/librarian/stats
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can access
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get total books
    $stmt = $db->prepare("SELECT COUNT(*) as total_books FROM books");
    $stmt->execute();
    $total_books = $stmt->fetch(PDO::FETCH_ASSOC)['total_books'];
    
    // Get available books
    $stmt = $db->prepare("SELECT COUNT(*) as available_books FROM books WHERE status = 'active'");
    $stmt->execute();
    $available_books = $stmt->fetch(PDO::FETCH_ASSOC)['available_books'];
    
    // Get issued books (active loans)
    $stmt = $db->prepare("SELECT COUNT(*) as issued_books FROM book_loans WHERE status = 'active'");
    $stmt->execute();
    $issued_books = $stmt->fetch(PDO::FETCH_ASSOC)['issued_books'];
    
    // Get overdue books
    $stmt = $db->prepare("
        SELECT COUNT(*) as overdue_books 
        FROM book_loans 
        WHERE status = 'active' AND due_date < CURDATE()
    ");
    $stmt->execute();
    $overdue_books = $stmt->fetch(PDO::FETCH_ASSOC)['overdue_books'];
    
    // Get total members (users with role 'user')
    $stmt = $db->prepare("SELECT COUNT(*) as total_members FROM users WHERE role = 'user'");
    $stmt->execute();
    $total_members = $stmt->fetch(PDO::FETCH_ASSOC)['total_members'];
    
    // Get active members (users who have borrowed at least one book)
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT user_id) as active_members 
        FROM book_loans
    ");
    $stmt->execute();
    $active_members = $stmt->fetch(PDO::FETCH_ASSOC)['active_members'];
    
    // Get pending reservations
    $stmt = $db->prepare("SELECT COUNT(*) as pending_reservations FROM book_reservations WHERE status = 'pending'");
    $stmt->execute();
    $pending_reservations = $stmt->fetch(PDO::FETCH_ASSOC)['pending_reservations'];
    
    // Get total fines
    $stmt = $db->prepare("SELECT SUM(amount) as total_fines FROM fines WHERE status = 'unpaid'");
    $stmt->execute();
    $total_fines = $stmt->fetch(PDO::FETCH_ASSOC)['total_fines'] ?? 0;
    
    // Get today's activities
    $stmt = $db->prepare("
        SELECT COUNT(*) as today_loans 
        FROM book_loans 
        WHERE DATE(loan_date) = CURDATE()
    ");
    $stmt->execute();
    $today_loans = $stmt->fetch(PDO::FETCH_ASSOC)['today_loans'];
    
    $stmt = $db->prepare("
        SELECT COUNT(*) as today_returns 
        FROM book_loans 
        WHERE DATE(return_date) = CURDATE()
    ");
    $stmt->execute();
    $today_returns = $stmt->fetch(PDO::FETCH_ASSOC)['today_returns'];
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'total_books' => (int)$total_books,
            'available_books' => (int)$available_books,
            'issued_books' => (int)$issued_books,
            'overdue_books' => (int)$overdue_books,
            'total_members' => (int)$total_members,
            'active_members' => (int)$active_members,
            'pending_reservations' => (int)$pending_reservations,
            'total_fines' => (float)$total_fines,
            'today_loans' => (int)$today_loans,
            'today_returns' => (int)$today_returns
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
