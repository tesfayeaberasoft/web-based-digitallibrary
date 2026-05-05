<?php
/**
 * Update User Password
 * PUT /api/users/{id}/password
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
    
    $user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }
    
    // Users can only update their own password
    if ($decoded->user_id != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Validate required fields
    if (!isset($data['current_password']) || !isset($data['new_password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current and new password are required']);
        exit;
    }
    
    if (strlen($data['new_password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get user
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Verify current password
    if (!password_verify($data['current_password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }
    
    // Update password
    $new_password_hash = password_hash($data['new_password'], PASSWORD_BCRYPT);
    
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$new_password_hash, $user_id]);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'update_password', 'user', ?, ?)
    ");
    $stmt->execute([$user_id, $user_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
