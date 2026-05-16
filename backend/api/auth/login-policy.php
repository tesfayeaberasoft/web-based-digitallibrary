<?php
/**
 * Public login policy (no auth required)
 * GET /api/auth/login-policy
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/security-helper.php';

    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $maxAttempts = getUserMaxLoginAttempts($db);

    echo json_encode([
        'success' => true,
        'data' => [
            'user_max_login_attempts' => $maxAttempts,
            'user_auto_suspend' => true,
            'applies_to_roles' => ['user'],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load login policy',
        'data' => [
            'user_max_login_attempts' => 5,
            'user_auto_suspend' => true,
        ],
    ]);
}
