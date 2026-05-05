<?php
/**
 * Mark All Notifications as Read
 * PUT /api/notifications/mark-all-read
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
    
    // Mark all user's notifications as read
    $stmt = $db->prepare("
        UPDATE notifications 
        SET is_read = 1, read_at = NOW()
        WHERE user_id = ? AND is_read = 0
    ");
    $stmt->execute([$decoded->user_id]);
    
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
