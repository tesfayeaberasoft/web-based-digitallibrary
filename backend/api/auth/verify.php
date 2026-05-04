<?php
/**
 * Verify JWT Token Endpoint
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../utils/jwt.php';

try {
    $user = requireAuth();
    
    echo json_encode([
        'success' => true,
        'message' => 'Token is valid',
        'data' => [
            'user_id' => $user['user_id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or expired token'
    ]);
}
?>