<?php
/**
 * Notification Logs API
 * GET /api/notifications/logs - Get notification logs for librarians
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can view notification logs
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get query parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50;
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $date_from = isset($_GET['date_from']) ? $_GET['date_from'] : '';
    $date_to = isset($_GET['date_to']) ? $_GET['date_to'] : '';
    
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    
    if (!empty($type)) {
        $where_conditions[] = "nl.type = ?";
        $params[] = $type;
    }
    
    if (!empty($status)) {
        $where_conditions[] = "nl.status = ?";
        $params[] = $status;
    }
    
    if (!empty($date_from)) {
        $where_conditions[] = "DATE(nl.sent_at) >= ?";
        $params[] = $date_from;
    }
    
    if (!empty($date_to)) {
        $where_conditions[] = "DATE(nl.sent_at) <= ?";
        $params[] = $date_to;
    }
    
    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM notification_logs nl $where_clause";
    $stmt = $db->prepare($count_sql);
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get logs with user information
    $sql = "
        SELECT 
            nl.*,
            u.full_name as user_name,
            u.email as user_email
        FROM notification_logs nl
        LEFT JOIN users u ON nl.user_id = u.id
        $where_clause
        ORDER BY nl.sent_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $db->prepare($sql);
    foreach ($params as $index => $param) {
        $stmt->bindValue($index + 1, $param);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get statistics
    $stats_sql = "
        SELECT 
            nl.type,
            nl.status,
            COUNT(*) as count,
            DATE(nl.sent_at) as date
        FROM notification_logs nl
        WHERE DATE(nl.sent_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY nl.type, nl.status, DATE(nl.sent_at)
        ORDER BY DATE(nl.sent_at) DESC
    ";
    $stmt = $db->prepare($stats_sql);
    $stmt->execute();
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get summary statistics
    $summary_sql = "
        SELECT 
            COUNT(*) as total_notifications,
            SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
            SUM(CASE WHEN type = 'email' THEN 1 ELSE 0 END) as email_count,
            SUM(CASE WHEN type = 'sms' THEN 1 ELSE 0 END) as sms_count,
            SUM(CASE WHEN DATE(sent_at) = CURDATE() THEN 1 ELSE 0 END) as today_count,
            SUM(CASE WHEN DATE(sent_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_count
        FROM notification_logs
        WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ";
    $stmt = $db->prepare($summary_sql);
    $stmt->execute();
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ],
        'statistics' => $stats,
        'summary' => $summary
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>