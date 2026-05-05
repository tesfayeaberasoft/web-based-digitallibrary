<?php
/**
 * Update User
 * PUT /api/users/{id}
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
    
    // Users can only update their own profile, admins can update any
    if ($decoded->role === 'user' && $decoded->user_id != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Check if user exists
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    $allowed_fields = ['full_name', 'email', 'phone', 'address'];
    
    // Admins can also update role and status
    if ($decoded->role === 'admin') {
        $allowed_fields[] = 'role';
        $allowed_fields[] = 'status';
    }
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }
    
    // Check if email is being changed and if it's already taken
    if (isset($data['email']) && $data['email'] !== $user['email']) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$data['email'], $user_id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already in use']);
            exit;
        }
    }
    
    $params[] = $user_id;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'update', 'user', ?, ?)
    ");
    $stmt->execute([$decoded->user_id, $user_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
