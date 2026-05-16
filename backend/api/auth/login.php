<?php
/**
 * User Login Endpoint
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../utils/security-helper.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $clientIp = getClientIpAddress();
    if (isIpBlocked($db, $clientIp)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Your IP address has been blocked. Contact the administrator.'
        ]);
        exit();
    }

    $email = trim($data->email);

    $query = "SELECT id, user_id, full_name, email, password_hash, role, status, profile_image 
              FROM users 
              WHERE email = :email 
              LIMIT 1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        logLoginAttempt($db, $email, false, $clientIp);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit();
    }

    $user = $stmt->fetch();
    $isRegularUser = isRegularUserRole($user['role']);
    $maxAttempts = getUserMaxLoginAttempts($db);

    if ($isRegularUser && $user['status'] === 'suspended') {
        logLoginAttempt($db, $email, false, $clientIp);
        http_response_code(403);
        echo json_encode(array_merge([
            'success' => false,
            'message' => 'Your account is suspended. Contact an administrator to restore access.',
        ], loginLockoutJsonExtras([
            'max_attempts' => $maxAttempts,
            'failed_attempts' => countFailedAttemptsSinceLastSuccess($db, $email),
            'remaining_attempts' => 0,
            'account_suspended' => true,
        ])));
        exit();
    }

    if (!password_verify($data->password, $user['password_hash'])) {
        if ($isRegularUser) {
            $lockout = handleRegularUserFailedLogin($db, $user, $clientIp);
            $extras = loginLockoutJsonExtras($lockout);

            if ($lockout['account_suspended']) {
                http_response_code(403);
                echo json_encode(array_merge([
                    'success' => false,
                    'message' => "Your account has been suspended after {$maxAttempts} failed login attempts. Contact an administrator.",
                ], $extras));
                exit();
            }

            $remaining = (int) $lockout['remaining_attempts'];
            http_response_code(401);
            echo json_encode(array_merge([
                'success' => false,
                'message' => $remaining === 1
                    ? 'Invalid email or password. 1 attempt remaining before your account is suspended.'
                    : "Invalid email or password. {$remaining} attempts remaining before your account is suspended.",
            ], $extras));
            exit();
        }

        logLoginAttempt($db, $email, false, $clientIp);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit();
    }

    if ($user['status'] !== 'active') {
        logLoginAttempt($db, $email, false, $clientIp);
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Account is not active. Please contact administrator.'
        ]);
        exit();
    }

    logLoginAttempt($db, $email, true, $clientIp);

    $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':id', $user['id']);
    $updateStmt->execute();

    $token = generateJWT([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);

    unset($user['password_hash']);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'token' => $token,
            'user' => $user
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login',
        'error' => $e->getMessage()
    ]);
}
