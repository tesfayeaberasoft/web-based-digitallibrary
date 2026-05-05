<?php
/**
 * Test borrowing functionality
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/jwt.php';

echo "Testing Borrow Functionality...\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // Get a test user
    $stmt = $db->query("SELECT id, user_id, full_name, email FROM users WHERE role = 'user' LIMIT 1");
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "❌ No user found in database\n";
        exit;
    }
    
    echo "✓ Test User: {$user['full_name']} (ID: {$user['id']})\n";
    
    // Get a test book
    $stmt = $db->query("SELECT id, title, available_copies FROM books WHERE available_copies > 0 LIMIT 1");
    $book = $stmt->fetch();
    
    if (!$book) {
        echo "❌ No available books found\n";
        exit;
    }
    
    echo "✓ Test Book: {$book['title']} (ID: {$book['id']}, Available: {$book['available_copies']})\n\n";
    
    // Simulate the API call
    echo "Simulating borrow request...\n";
    
    $data = [
        'book_id' => $book['id'],
        'user_id' => $user['id']
    ];
    
    // Check if book is available
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ? AND status = 'available'");
    $stmt->execute([$data['book_id']]);
    $bookCheck = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$bookCheck) {
        echo "❌ Book not found or unavailable\n";
        exit;
    }
    echo "✓ Book is available\n";
    
    if ($bookCheck['available_copies'] <= 0) {
        echo "❌ No copies available\n";
        exit;
    }
    echo "✓ Copies available: {$bookCheck['available_copies']}\n";
    
    // Check user's active loans
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$data['user_id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ User's active loans: {$result['count']}\n";
    
    // Check if user already has this book
    $stmt = $db->prepare("SELECT id FROM book_loans WHERE user_id = ? AND book_id = ? AND status = 'active'");
    $stmt->execute([$data['user_id'], $data['book_id']]);
    if ($stmt->fetch()) {
        echo "❌ User already has this book\n";
        exit;
    }
    echo "✓ User doesn't have this book yet\n";
    
    // Try to create loan
    echo "\nAttempting to create loan...\n";
    
    $borrow_days = 14;
    $due_date = date('Y-m-d', strtotime("+$borrow_days days"));
    
    $stmt = $db->prepare("
        INSERT INTO book_loans (user_id, book_id, issued_by, loan_date, due_date, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'active')
    ");
    
    $result = $stmt->execute([
        $data['user_id'],
        $data['book_id'],
        $user['id'], // issued by same user for testing
        $due_date
    ]);
    
    if ($result) {
        $loan_id = $db->lastInsertId();
        echo "✓ Loan created successfully! Loan ID: $loan_id\n";
        
        // Update book availability
        $stmt = $db->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
        $stmt->execute([$data['book_id']]);
        echo "✓ Book availability updated\n";
        
        // Rollback for testing
        $stmt = $db->prepare("DELETE FROM book_loans WHERE id = ?");
        $stmt->execute([$loan_id]);
        $stmt = $db->prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?");
        $stmt->execute([$data['book_id']]);
        echo "✓ Test data rolled back\n";
        
        echo "\n✅ BORROW FUNCTIONALITY WORKS!\n";
    } else {
        echo "❌ Failed to create loan\n";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
