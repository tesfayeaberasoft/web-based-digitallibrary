<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query('SELECT id, email, role FROM users LIMIT 10');

echo "Users in database:\n";
while($row = $stmt->fetch()) {
    echo $row['id'] . ' - ' . $row['email'] . ' - ' . $row['role'] . "\n";
}
?>