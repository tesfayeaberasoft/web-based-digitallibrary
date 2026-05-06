<?php
/**
 * Direct API Test - No Authentication
 * This will show us the exact error
 */

echo "=== Testing Config Loading ===\n";
require_once __DIR__ . '/config/config.php';
echo "✓ Config loaded\n";
echo "JWT_SECRET_KEY defined: " . (defined('JWT_SECRET_KEY') ? 'YES' : 'NO') . "\n";
echo "JWT_ALGORITHM defined: " . (defined('JWT_ALGORITHM') ? 'YES' : 'NO') . "\n";
echo "JWT_EXPIRATION defined: " . (defined('JWT_EXPIRATION') ? 'YES' : 'NO') . "\n\n";

echo "=== Testing Database Connection ===\n";
require_once __DIR__ . '/config/database.php';
try {
    $db = Database::getInstance()->getConnection();
    echo "✓ Database connected\n\n";
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n\n";
    exit(1);
}

echo "=== Testing JWT Functions ===\n";
require_once __DIR__ . '/utils/jwt.php';
echo "✓ JWT functions loaded\n";

// Test generating a token
$testPayload = [
    'user_id' => 1,
    'email' => 'test@example.com',
    'role' => 'user'
];
$token = generateJWT($testPayload);
echo "✓ Token generated: " . substr($token, 0, 50) . "...\n";

// Test verifying the token
$decoded = verifyJWT($token);
if ($decoded) {
    echo "✓ Token verified\n";
    echo "  User ID: " . $decoded['user_id'] . "\n";
    echo "  Email: " . $decoded['email'] . "\n";
    echo "  Role: " . $decoded['role'] . "\n\n";
} else {
    echo "✗ Token verification failed\n\n";
}

echo "=== Testing Loans Query ===\n";
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ Loans table accessible\n";
    echo "  Total loans: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "✗ Loans query error: " . $e->getMessage() . "\n\n";
}

echo "=== Testing Notifications Query ===\n";
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM notifications");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ Notifications table accessible\n";
    echo "  Total notifications: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "✗ Notifications query error: " . $e->getMessage() . "\n\n";
}

echo "=== All Tests Complete ===\n";
echo "If all tests passed, the backend is working correctly.\n";
echo "The issue might be with the frontend or CORS.\n";
?>
