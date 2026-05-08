<?php
/**
 * Mark Notification as Read API
 * PUT /api/notifications/{id}/read
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    $notification_id = $_GET['id'] ?? null;
    
    if (!$notification_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Notification ID is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Update notification status
    $stmt = $db->prepare("
        UPDATE notifications 
        SET status = 'read', updated_at = NOW()
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notification_id, $decoded['user_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Notification not found'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>