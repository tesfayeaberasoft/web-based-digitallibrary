<?php
/**
 * Get Single User Details (Enhanced)
 * GET /api/users/{id}
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get user ID from URL parameter
    $user_id = $_GET['id'] ?? null;
    
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    // Users can only view their own profile, admins/librarians can view any
    if ($decoded['role'] === 'user' && $decoded['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized to view this user']);
        exit;
    }
    
    // Get comprehensive user details
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.user_id,
            u.full_name,
            u.email,
            u.phone,
            u.address,
            u.role,
            u.status,
            u.profile_image,
            u.created_at,
            u.last_login,
            u.updated_at
        FROM users u
        WHERE u.id = ?
    ");
    
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Get user statistics
    
    // Active loans
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM book_loans 
        WHERE user_id = ? AND status = 'active'
    ");
    $stmt->execute([$user_id]);
    $user['active_loans'] = (int)$stmt->fetch()['count'];
    
    // Total loans (all time)
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM book_loans 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $user['total_loans'] = (int)$stmt->fetch()['count'];
    
    // Unpaid fines
    $stmt = $db->prepare("
        SELECT COALESCE(SUM(amount - paid_amount), 0) as total 
        FROM fines 
        WHERE user_id = ? AND status != 'paid'
    ");
    $stmt->execute([$user_id]);
    $user['unpaid_fines'] = (float)$stmt->fetch()['total'];
    
    // Total fines (all time)
    $stmt = $db->prepare("
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM fines 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $user['total_fines'] = (float)$stmt->fetch()['total'];
    
    // Active reservations
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM book_reservations 
        WHERE user_id = ? AND status = 'pending'
    ");
    $stmt->execute([$user_id]);
    $user['active_reservations'] = (int)$stmt->fetch()['count'];
    
    // Recent activity (last 10 actions)
    $stmt = $db->prepare("
        SELECT 
            'loan' as type,
            b.title as book_title,
            bl.loan_date as date,
            bl.status,
            'Borrowed book' as action
        FROM book_loans bl
        JOIN books b ON bl.book_id = b.id
        WHERE bl.user_id = ?
        
        UNION ALL
        
        SELECT 
            'reservation' as type,
            b.title as book_title,
            br.created_at as date,
            br.status,
            'Reserved book' as action
        FROM book_reservations br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = ?
        
        ORDER BY date DESC
        LIMIT 10
    ");
    $stmt->execute([$user_id, $user_id]);
    $user['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Current borrowed books
    if ($user['active_loans'] > 0) {
        $stmt = $db->prepare("
            SELECT 
                b.id,
                b.title,
                b.author,
                bl.loan_date,
                bl.due_date,
                DATEDIFF(bl.due_date, CURDATE()) as days_remaining
            FROM book_loans bl
            JOIN books b ON bl.book_id = b.id
            WHERE bl.user_id = ? AND bl.status = 'active'
            ORDER BY bl.due_date ASC
        ");
        $stmt->execute([$user_id]);
        $user['current_books'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $user['current_books'] = [];
    }
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
