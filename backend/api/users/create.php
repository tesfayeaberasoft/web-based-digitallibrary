<?php
/**
 * Create User API (Admin only)
 * POST /api/users/create
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins and super-admins can create users
    if ($decoded['role'] !== 'admin' && $decoded['role'] !== 'super-admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['full_name', 'email', 'password'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
            exit;
        }
    }
    
    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Generate unique user_id
    $user_id_prefix = strtoupper($input['role'] ?? 'USR');
    $stmt = $db->prepare("SELECT COUNT(*) + 1 as next_id FROM users WHERE user_id LIKE ?");
    $stmt->execute([$user_id_prefix . '%']);
    $next_id = $stmt->fetch()['next_id'];
    $user_id = $user_id_prefix . str_pad($next_id, 3, '0', STR_PAD_LEFT);
    
    // Hash password
    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    // Prepare user data
    $full_name = trim($input['full_name']);
    $email = strtolower(trim($input['email']));
    $phone = $input['phone'] ?? null;
    $address = $input['address'] ?? null;
    $role = $input['role'] ?? 'user';
    $status = $input['status'] ?? 'active';
    
    // Validate role
    $valid_roles = ['user', 'librarian', 'admin'];
    if (!in_array($role, $valid_roles)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid role specified']);
        exit;
    }
    
    // Validate status
    $valid_statuses = ['active', 'inactive', 'suspended'];
    if (!in_array($status, $valid_statuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status specified']);
        exit;
    }
    
    // Insert user
    $stmt = $db->prepare("
        INSERT INTO users (user_id, full_name, email, phone, address, password_hash, role, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([
        $user_id,
        $full_name,
        $email,
        $phone,
        $address,
        $password_hash,
        $role,
        $status
    ]);
    
    if ($result) {
        $new_user_id = $db->lastInsertId();
        
        // Get the created user data
        $stmt = $db->prepare("
            SELECT id, user_id, full_name, email, phone, address, role, status, created_at 
            FROM users WHERE id = ?
        ");
        $stmt->execute([$new_user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user
        ]);
    } else {
        throw new Exception('Failed to create user');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>