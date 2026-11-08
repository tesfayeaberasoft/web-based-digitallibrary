<?php
/**
 * Check whether an email address is available for registration.
 */

header('Content-Type: application/json');
header('Cache-Control: no-store');
require_once __DIR__ . '/../../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
    exit();
}

$email = isset($data['email']) && is_string($data['email'])
    ? strtolower(trim($data['email']))
    : '';
if ($email === '' || strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Enter a valid email address.']);
    exit();
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed');
    }

    $stmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $available = !$stmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'available' => $available,
        'message' => $available ? 'Email address is available.' : 'Email already registered.'
    ]);
} catch (Throwable $e) {
    error_log('Email availability check failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 'EMAIL_AVAILABILITY_QUERY_FAILED',
        'message' => 'Unable to verify this email address. Please try again.'
    ]);
}
