<?php
/**
 * Simple API Test Script
 * Run this to test if routing is working
 */

echo "Testing API Routing...\n\n";

// Test 1: Check if database config exists
echo "1. Checking database config... ";
if (file_exists(__DIR__ . '/config/database.php')) {
    echo "✓ Found\n";
} else {
    echo "✗ Not found\n";
}

// Test 2: Check if index.php exists
echo "2. Checking index.php... ";
if (file_exists(__DIR__ . '/index.php')) {
    echo "✓ Found\n";
} else {
    echo "✗ Not found\n";
}

// Test 3: Check if router.php exists
echo "3. Checking router.php... ";
if (file_exists(__DIR__ . '/router.php')) {
    echo "✓ Found\n";
} else {
    echo "✗ Not found\n";
}

// Test 4: Check API endpoints
echo "4. Checking API endpoint files:\n";
$endpoints = [
    'auth/login.php',
    'auth/register.php',
    'books/list.php',
    'loans/list.php',
    'categories/list.php',
    'notifications/list.php'
];

foreach ($endpoints as $endpoint) {
    $path = __DIR__ . '/api/' . $endpoint;
    echo "   - $endpoint... ";
    if (file_exists($path)) {
        echo "✓\n";
    } else {
        echo "✗ NOT FOUND\n";
    }
}

// Test 5: Test database connection
echo "\n5. Testing database connection... ";
try {
    require_once __DIR__ . '/config/database.php';
    $db = Database::getInstance()->getConnection();
    if ($db) {
        echo "✓ Connected\n";
        
        // Test query
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "   Users in database: " . $result['count'] . "\n";
    } else {
        echo "✗ Failed\n";
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\nTest complete!\n";
?>
