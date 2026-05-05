<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query("SELECT id, title, status, available_copies FROM books LIMIT 5");

echo "Books in database:\n";
while($book = $stmt->fetch()) {
    echo "ID: {$book['id']}, Title: {$book['title']}, Status: {$book['status']}, Available: {$book['available_copies']}\n";
}
?>
