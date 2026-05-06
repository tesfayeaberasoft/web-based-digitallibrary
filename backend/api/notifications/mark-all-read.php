<?php
/**
 * Mark All Notifications as Read
 * PUT /api/notifications/mark-all-read
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Mark all user's notifications as read
    $stmt = $db->prepare("
        UPDATE notifications 
        SET status = 'read', read_at = NOW()
        WHERE user_id = ? AND status = 'unread'
    ");
    $stmt->execute([$decoded['user_id']]);
    
    $count = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'message' => "$count notifications marked as read",
        'count' => $count
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
