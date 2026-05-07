<?php
/**
 * Barcode Lookup API
 * GET /api/barcode/lookup?code={barcode}&type={book|user}
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can use barcode lookup
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $code = isset($_GET['code']) ? trim($_GET['code']) : '';
    $type = isset($_GET['type']) ? trim($_GET['type']) : 'auto';
    
    if (empty($code)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Barcode is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $result = null;
    $detected_type = null;
    
    // Auto-detect type or search specific type
    if ($type === 'auto' || $type === 'book') {
        // Try to find book by ISBN or ID
        $stmt = $db->prepare("
            SELECT b.*, c.name as category_name, c.color_code as category_color
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.isbn = ? OR b.id = ?
        ");
        $stmt->execute([$code, $code]);
        $book = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($book) {
            $result = $book;
            $detected_type = 'book';
        }
    }
    
    if (!$result && ($type === 'auto' || $type === 'user')) {
        // Try to find user by user_id or ID
        $stmt = $db->prepare("
            SELECT id, user_id, full_name, email, phone, role, status, profile_image
            FROM users
            WHERE user_id = ? OR id = ?
        ");
        $stmt->execute([$code, $code]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Get user's current loan statistics
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as active_loans,
                    SUM(CASE WHEN due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_loans
                FROM book_loans 
                WHERE user_id = ? AND status = 'active'
            ");
            $stmt->execute([$user['id']]);
            $loan_stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get pending fines
            $stmt = $db->prepare("
                SELECT SUM(amount - paid_amount) as pending_fines
                FROM fines 
                WHERE user_id = ? AND status = 'pending'
            ");
            $stmt->execute([$user['id']]);
            $fine_stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $user['active_loans'] = (int)$loan_stats['active_loans'];
            $user['overdue_loans'] = (int)$loan_stats['overdue_loans'];
            $user['pending_fines'] = (float)($fine_stats['pending_fines'] ?? 0);
            
            $result = $user;
            $detected_type = 'user';
        }
    }
    
    if (!$result) {
        http_response_code(404);
        echo json_encode([
            'success' => false, 
            'message' => 'No book or user found with barcode: ' . $code
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'type' => $detected_type,
        'data' => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>