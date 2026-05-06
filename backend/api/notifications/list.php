<?php
/**
 * List Notifications
 * GET /api/notifications
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Users can only see their own notifications
    $user_id = $decoded['user_id'];
    
    // Filter by read status
    $where = ["user_id = ?"];
    $params = [$user_id];
    
    if (isset($_GET['is_read'])) {
        $isRead = $_GET['is_read'] === 'true';
        $where[] = "status = ?";
        $params[] = $isRead ? 'read' : 'unread';
    }
    
    // Filter by type
    if (isset($_GET['type'])) {
        $where[] = "type = ?";
        $params[] = $_GET['type'];
    }
    
    $where_clause = 'WHERE ' . implode(' AND ', $where);
    
    // Pagination
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $stmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM notifications
        $where_clause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get unread count
    $stmt = $db->prepare("
        SELECT COUNT(*) as unread
        FROM notifications
        WHERE user_id = ? AND status = 'unread'
    ");
    $stmt->execute([$user_id]);
    $unread_count = $stmt->fetch(PDO::FETCH_ASSOC)['unread'];
    
    // Get notifications
    $stmt = $db->prepare("
        SELECT *
        FROM notifications
        $where_clause
        ORDER BY sent_at DESC
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
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => $unread_count,
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
