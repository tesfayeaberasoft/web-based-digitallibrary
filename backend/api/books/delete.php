<?php
/**
 * Delete Book
 * DELETE /api/books/{id}
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    
    $decoded = requireAuth();
    
    // Only admin and librarian can delete books
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $book_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($book_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get book details before deletion for notifications
    $stmt = $db->prepare("SELECT title, author FROM books WHERE id = ?");
    $stmt->execute([$book_id]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Check if book has active loans
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE book_id = ? AND status = 'active'");
    $stmt->execute([$book_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete book with active loans'
        ]);
        exit;
    }
    
    // Get users who have this book reserved (to notify them)
    $stmt = $db->prepare("
        SELECT DISTINCT user_id 
        FROM book_reservations 
        WHERE book_id = ? AND status = 'pending'
    ");
    $stmt->execute([$book_id]);
    $reserved_users = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Delete the book (hard delete since schema doesn't have deleted_at column)
    $stmt = $db->prepare("DELETE FROM books WHERE id = ?");
    $stmt->execute([$book_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Send notifications to users who had this book reserved
    if (!empty($reserved_users)) {
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message, status)
            VALUES (?, 'general', 'Book Removed', ?, 'unread')
        ");
        
        $message = "The book '{$book['title']}' by {$book['author']} has been removed from the library. Your reservation has been cancelled.";
        
        foreach ($reserved_users as $user_id) {
            $stmt->execute([$user_id, $message]);
        }
    }
    
    // Send notification to the librarian/admin who deleted the book
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message, status)
        VALUES (?, 'general', 'Book Deleted', ?, 'unread')
    ");
    $librarian_message = "You have successfully deleted the book '{$book['title']}' by {$book['author']} from the library.";
    $stmt->execute([$decoded['user_id'], $librarian_message]);
    
    // Log activity (using correct column names: table_name and record_id)
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
        VALUES (?, 'delete_book', 'books', ?, ?)
    ");
    $stmt->execute([$decoded['user_id'], $book_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book deleted successfully',
        'notifications_sent' => count($reserved_users) + 1
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
