<?php
/**
 * List Loans
 * GET /api/loans
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
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Build query based on role
    $where = [];
    $params = [];
    
    // Regular users can only see their own loans
    if ($decoded->role === 'user') {
        $where[] = "l.user_id = ?";
        $params[] = $decoded->user_id;
    }
    
    // Filter by user_id if provided (admin/librarian only)
    if (isset($_GET['user_id']) && in_array($decoded->role, ['admin', 'librarian'])) {
        $where[] = "l.user_id = ?";
        $params[] = intval($_GET['user_id']);
    }
    
    // Filter by status
    if (isset($_GET['status'])) {
        $where[] = "l.status = ?";
        $params[] = $_GET['status'];
    }
    
    // Filter by overdue
    if (isset($_GET['overdue']) && $_GET['overdue'] === 'true') {
        $where[] = "l.due_date < CURDATE() AND l.status = 'active'";
    }
    
    $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Pagination
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM book_loans l
        $where_clause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get loans
    $stmt = $db->prepare("
        SELECT 
            l.*,
            b.title as book_title,
            b.author as book_author,
            b.isbn,
            u.full_name as user_name,
            u.email as user_email,
            issuer.full_name as issued_by_name,
            returner.full_name as returned_to_name,
            DATEDIFF(l.due_date, CURDATE()) as days_until_due,
            CASE 
                WHEN l.status = 'active' AND l.due_date < CURDATE() THEN 'overdue'
                ELSE l.status
            END as display_status
        FROM book_loans l
        JOIN books b ON l.book_id = b.id
        JOIN users u ON l.user_id = u.id
        LEFT JOIN users issuer ON l.issued_by = issuer.id
        LEFT JOIN users returner ON l.returned_to = returner.id
        $where_clause
        ORDER BY l.issue_date DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'loans' => $loans,
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
