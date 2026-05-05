<?php
/**
 * List Fines
 * GET /api/fines
 */

header('Content-Type: application/json');

try {
    // Verify JWT token
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No token provided']);
        exit;
    }
    
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = JWT::decode($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit;
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Build query based on role
    $where = [];
    $params = [];
    
    // Regular users can only see their own fines
    if ($decoded->role === 'user') {
        $where[] = "f.user_id = ?";
        $params[] = $decoded->user_id;
    }
    
    // Filter by user_id if provided (admin/librarian only)
    if (isset($_GET['user_id']) && in_array($decoded->role, ['admin', 'librarian'])) {
        $where[] = "f.user_id = ?";
        $params[] = intval($_GET['user_id']);
    }
    
    // Filter by status
    if (isset($_GET['status'])) {
        $where[] = "f.status = ?";
        $params[] = $_GET['status'];
    }
    
    $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Pagination
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM fines f
        $where_clause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get fines
    $stmt = $db->prepare("
        SELECT 
            f.*,
            u.full_name as user_name,
            u.email as user_email,
            bl.book_id,
            b.title as book_title,
            b.author as book_author,
            bl.issue_date,
            bl.due_date,
            bl.return_date
        FROM fines f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN book_loans bl ON f.loan_id = bl.id
        LEFT JOIN books b ON bl.book_id = b.id
        $where_clause
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $fines = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate totals
    $stmt = $db->prepare("
        SELECT 
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount
        FROM fines f
        $where_clause
    ");
    $stmt->execute(array_slice($params, 0, count($params) - 2)); // Remove limit and offset
    $totals = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'fines' => $fines,
        'totals' => $totals,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
