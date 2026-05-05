<?php
/**
 * Clear John Doe's loans for testing
 */

require_once 'config/database.php';

$db = Database::getInstance()->getConnection();

echo "Clearing John Doe's active loans...\n\n";

// Get John Doe's user ID
$stmt = $db->prepare("SELECT id, full_name FROM users WHERE email = 'john.doe@example.com'");
$stmt->execute();
$user = $stmt->fetch();

if (!$user) {
    echo "User not found!\n";
    exit;
}

echo "User: {$user['full_name']} (ID: {$user['id']})\n";

// Get active loans
$stmt = $db->prepare("
    SELECT bl.id, b.title 
    FROM book_loans bl
    JOIN books b ON bl.book_id = b.id
    WHERE bl.user_id = ? AND bl.status = 'active'
");
$stmt->execute([$user['id']]);
$loans = $stmt->fetchAll();

echo "Active loans: " . count($loans) . "\n\n";

foreach ($loans as $loan) {
    echo "  - Loan #{$loan['id']}: {$loan['title']}\n";
}

// Return all books
$stmt = $db->prepare("
    UPDATE book_loans 
    SET status = 'returned', return_date = CURDATE()
    WHERE user_id = ? AND status = 'active'
");
$stmt->execute([$user['id']]);

echo "\n✓ Returned " . $stmt->rowCount() . " books\n";

// Update book availability
$db->exec("
    UPDATE books b
    SET available_copies = total_copies - (
        SELECT COUNT(*) 
        FROM book_loans bl 
        WHERE bl.book_id = b.id AND bl.status = 'active'
    )
");

echo "✓ Updated book availability\n";
echo "\n✅ John Doe can now borrow books again!\n";
?>
