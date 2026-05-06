<?php
/**
 * List Reservations
 * GET /api/reservations
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Build query based on role
    $where = [];
    $params = [];
    
    // Regular users can only see their own reservations
    if ($decoded['role'] === 'user') {
        $where[] = "r.user_id = ?";
        $params[] = $decoded['user_id'];
    }
    
    // Filter by user_id if provided (admin/librarian only)
    if (isset($_GET['user_id']) && in_array($decoded['role'], ['admin', 'librarian'])) {
        $where[] = "r.user_id = ?";
        $params[] = intval($_GET['user_id']);
    }
    
    // Filter by status
    if (isset($_GET['status'])) {
        $where[] = "r.status = ?";
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
        FROM book_reservations r
        $where_clause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get reservations with queue position
    $stmt = $db->prepare("
        SELECT 
            r.*,
            b.title as book_title,
            b.author as book_author,
            b.isbn,
            b.available_copies,
            u.full_name as user_name,
            u.email as user_email,
            (
                SELECT COUNT(*) + 1
                FROM book_reservations r2
                WHERE r2.book_id = r.book_id 
                AND r2.status = 'pending' 
                AND r2.id < r.id
            ) as queue_position
        FROM book_reservations r
        JOIN books b ON r.book_id = b.id
        JOIN users u ON r.user_id = u.id
        $where_clause
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    // Bind parameters with correct types
    $paramIndex = 1;
    foreach ($params as $param) {
        $stmt->bindValue($paramIndex++, $param);
    }
    // Bind LIMIT and OFFSET as integers
    $stmt->bindValue($paramIndex++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($paramIndex++, $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'reservations' => $reservations,
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
