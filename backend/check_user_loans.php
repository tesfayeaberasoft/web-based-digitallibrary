<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();

// Get all users with their active loan counts
$stmt = $db->query("
    SELECT 
        u.id, 
        u.full_name, 
        u.email,
        COUNT(bl.id) as active_loans
    FROM users u
    LEFT JOIN book_loans bl ON u.id = bl.user_id AND bl.status = 'active'
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY active_loans DESC
");

echo "Users and their active loans:\n\n";
while($user = $stmt->fetch()) {
    echo "User: {$user['full_name']} ({$user['email']})\n";
    echo "  Active Loans: {$user['active_loans']}\n\n";
}

// Show all active loans
echo "\n=== All Active Loans ===\n";
$stmt = $db->query("
    SELECT 
        bl.id,
        u.full_name as user_name,
        b.title as book_title,
        bl.loan_date,
        bl.due_date,
        bl.status
    FROM book_loans bl
    JOIN users u ON bl.user_id = u.id
    JOIN books b ON bl.book_id = b.id
    WHERE bl.status = 'active'
    ORDER BY bl.loan_date DESC
");

while($loan = $stmt->fetch()) {
    echo "Loan #{$loan['id']}: {$loan['user_name']} borrowed '{$loan['book_title']}'\n";
    echo "  Date: {$loan['loan_date']}, Due: {$loan['due_date']}, Status: {$loan['status']}\n";
}
?>
