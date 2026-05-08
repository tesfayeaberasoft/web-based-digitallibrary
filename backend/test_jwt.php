<?php
require_once 'utils/jwt.php';

// Test JWT generation and verification
$payload = [
    'user_id' => 1,
    'email' => 'admin@digitallibrary.com',
    'role' => 'admin'
];

$token = generateJWT($payload);
echo "Generated token: $token\n\n";

$decoded = verifyJWT($token);
echo "Decoded payload:\n";
print_r($decoded);

// Test requireAuth function
echo "\nTesting requireAuth with token...\n";
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";

try {
    $result = requireAuth();
    echo "Auth successful:\n";
    print_r($result);
} catch (Exception $e) {
    echo "Auth failed: " . $e->getMessage() . "\n";
}
?>