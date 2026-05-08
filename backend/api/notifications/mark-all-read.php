<?php
/**
 * Mark All Notifications as Read API
 * PUT /api/notifications/mark-all-read
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Update all unread notifications for the user
    $stmt = $db->prepare("
        UPDATE notifications 
        SET status = 'read', updated_at = NOW()
        WHERE user_id = ? AND status = 'unread'
    ");
    $stmt->execute([$decoded['user_id']]);
    
    $updated_count = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'message' => "Marked $updated_count notifications as read",
        'updated_count' => $updated_count
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>