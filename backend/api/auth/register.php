<?php
/**
 * User Registration Endpoint
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->full_name) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Full name, email, and password are required'
    ]);
    exit();
}

// Validate email format
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit();
}

// Validate password length
if (strlen($data->password) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 6 characters long'
    ]);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data->email);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        exit();
    }

    // Generate user ID
    $userIdQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'user'";
    $userIdStmt = $db->query($userIdQuery);
    $userCount = $userIdStmt->fetch()['count'];
    $userId = 'USR' . str_pad($userCount + 1, 3, '0', STR_PAD_LEFT);

    // Hash password
    $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);

    // Insert new user
    $insertQuery = "INSERT INTO users (user_id, full_name, email, phone, address, password_hash, role, status) 
                    VALUES (?, ?, ?, ?, ?, ?, 'user', 'active')";
    
    $insertStmt = $db->prepare($insertQuery);
    
    // Use execute with array instead of bindParam
    if ($insertStmt->execute([
        $userId,
        $data->full_name,
        $data->email,
        $data->phone ?? null,
        $data->address ?? null,
        $passwordHash
    ])) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful. Please login.',
            'data' => [
                'user_id' => $userId,
                'email' => $data->email
            ]
        ]);
    } else {
        throw new Exception('Failed to create user account');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during registration',
        'error' => $e->getMessage()
    ]);
}
?>