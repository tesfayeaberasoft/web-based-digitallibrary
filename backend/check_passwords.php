<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query('SELECT id, email, role, password_hash FROM users WHERE role IN ("admin", "librarian") LIMIT 5');

echo "Admin/Librarian users:\n";
while($row = $stmt->fetch()) {
    echo $row['id'] . ' - ' . $row['email'] . ' - ' . $row['role'] . "\n";
    echo "Password hash: " . substr($row['password_hash'], 0, 20) . "...\n";
    
    // Test common passwords
    $passwords = ['admin123', 'librarian123', 'password', '123456'];
    foreach ($passwords as $pass) {
        if (password_verify($pass, $row['password_hash'])) {
            echo "✅ Password is: $pass\n";
            break;
        }
    }
    echo "\n";
}
?>