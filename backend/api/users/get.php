<?php
/**
 * Get Single User
 * GET /api/users/{id}
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
    
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        exit;
    }
    
    // Users can only view their own profile, admins/librarians can view any
    if ($decoded->role === 'user' && $decoded->user_id != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get user details with statistics
    $stmt = $db->prepare("
        SELECT 
            u.*,
            COUNT(DISTINCT bl.id) as total_loans,
            COUNT(DISTINCT CASE WHEN bl.status = 'active' THEN bl.id END) as active_loans,
            COUNT(DISTINCT br.id) as total_reservations,
            COALESCE(SUM(f.amount), 0) as total_fines,
            COALESCE(SUM(CASE WHEN f.status = 'pending' THEN f.amount ELSE 0 END), 0) as pending_fines
        FROM users u
        LEFT JOIN book_loans bl ON u.id = bl.user_id
        LEFT JOIN book_reservations br ON u.id = br.user_id
        LEFT JOIN fines f ON u.id = f.user_id
        WHERE u.id = ?
        GROUP BY u.id
    ");
    
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Remove password from response
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
