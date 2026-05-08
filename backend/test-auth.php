<?php
// Test authentication and admin stats API
header('Content-Type: application/json');

echo "=== Testing Admin Stats API ===\n";

// Test 1: Check if we can access the database
try {
    require_once 'config/database.php';
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection: OK\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit;
}

// Test 2: Check JWT utility
try {
    require_once 'utils/jwt.php';
    echo "✅ JWT utility loaded: OK\n";
} catch (Exception $e) {
    echo "❌ JWT utility failed: " . $e->getMessage() . "\n";
    exit;
}

// Test 3: Test login to get a valid token
try {
    $stmt = $db->prepare("SELECT id, email, password_hash, role FROM users WHERE email = ? AND role = 'admin'");
    $stmt->execute(['admin@digitallibrary.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify('password', $user['password_hash'])) {
        $token = generateJWT([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);
        echo "✅ Admin login: OK\n";
        echo "Token: " . substr($token, 0, 50) . "...\n";
        
        // Test 4: Test token verification
        $decoded = verifyJWT($token);
        if ($decoded) {
            echo "✅ Token verification: OK\n";
            echo "User ID: " . $decoded['user_id'] . "\n";
            echo "Role: " . $decoded['role'] . "\n";
        } else {
            echo "❌ Token verification failed\n";
        }
        
    } else {
        echo "❌ Admin login failed\n";
    }
} catch (Exception $e) {
    echo "❌ Login test failed: " . $e->getMessage() . "\n";
}

// Test 5: Test a simple stats query
try {
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $total_users = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "✅ Stats query test: OK (Total users: $total_users)\n";
} catch (Exception $e) {
    echo "❌ Stats query failed: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>