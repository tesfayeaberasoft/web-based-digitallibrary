<?php
// Test the admin stats API directly
require_once 'config/database.php';
require_once 'utils/jwt.php';

// Get admin user and generate token
$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT id, email, password_hash, role FROM users WHERE email = ? AND role = 'admin'");
$stmt->execute(['admin@digitallibrary.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify('password', $user['password_hash'])) {
    $token = generateJWT([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
    
    echo "Generated token: " . substr($token, 0, 50) . "...\n\n";
    
    // Simulate the API call
    $_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    echo "=== Testing Admin Stats API ===\n";
    
    // Capture output
    ob_start();
    
    try {
        // Include the admin stats API
        include 'api/admin/stats.php';
        $output = ob_get_contents();
        ob_end_clean();
        
        echo "API Response:\n";
        echo $output . "\n";
        
        // Try to decode JSON
        $data = json_decode($output, true);
        if ($data) {
            echo "\n=== Parsed Response ===\n";
            echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            if (isset($data['stats']['analytics'])) {
                echo "Analytics data found!\n";
                echo "Popular books: " . count($data['stats']['analytics']['popular_books']) . "\n";
                echo "Peak hours: " . count($data['stats']['analytics']['peak_hours']) . "\n";
            }
        } else {
            echo "Failed to parse JSON response\n";
        }
        
    } catch (Exception $e) {
        ob_end_clean();
        echo "Error: " . $e->getMessage() . "\n";
        echo "Stack trace: " . $e->getTraceAsString() . "\n";
    }
    
} else {
    echo "Failed to authenticate admin user\n";
}
?>