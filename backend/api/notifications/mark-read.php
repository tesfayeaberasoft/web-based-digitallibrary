<?php
/**
 * Mark Notification as Read
 * PUT /api/notifications/{id}/read
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
    
    $notification_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($notification_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid notification ID']);
        exit;
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Update notification (only if it belongs to the user)
    $stmt = $db->prepare("
        UPDATE notifications 
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$notification_id, $decoded->user_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Notification not found']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Notification marked as read'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
