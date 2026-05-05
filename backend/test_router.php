<?php
/**
 * Quick test script to verify router is working
 */

echo "Testing router configuration...\n\n";

// Test 1: Check if router.php exists
if (file_exists(__DIR__ . '/router.php')) {
    echo "✓ router.php exists\n";
} else {
    echo "✗ router.php NOT found\n";
    exit(1);
}

// Test 2: Check if index.php exists
if (file_exists(__DIR__ . '/index.php')) {
    echo "✓ index.php exists\n";
} else {
    echo "✗ index.php NOT found\n";
    exit(1);
}

// Test 3: Check if config files exist
if (file_exists(__DIR__ . '/config/config.php')) {
    echo "✓ config.php exists\n";
} else {
    echo "✗ config.php NOT found\n";
    exit(1);
}

if (file_exists(__DIR__ . '/config/database.php')) {
    echo "✓ database.php exists\n";
} else {
    echo "✗ database.php NOT found\n";
    exit(1);
}

// Test 4: Check if auth endpoints exist
if (file_exists(__DIR__ . '/api/auth/login.php')) {
    echo "✓ login.php exists\n";
} else {
    echo "✗ login.php NOT found\n";
    exit(1);
}

echo "\n✓ All files present!\n";
echo "\nTo start the server, run:\n";
echo "  php -S localhost:8000 router.php\n\n";
echo "Then test with:\n";
echo "  curl -X OPTIONS http://localhost:8000/api/auth/login\n";
echo "  curl -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@digitallibrary.com\",\"password\":\"password\"}'\n";
?>
