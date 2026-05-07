<?php
/**
 * Bulk Delete Books
 * DELETE /api/books/bulk-delete
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can perform bulk operations
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['book_ids']) || !is_array($data['book_ids']) || empty($data['book_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book IDs are required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $book_ids = array_map('intval', $data['book_ids']);
    
    // Check if any books are currently loaned out
    $placeholders = str_repeat('?,', count($book_ids) - 1) . '?';
    $stmt = $db->prepare("
        SELECT DISTINCT b.id, b.title 
        FROM books b 
        INNER JOIN book_loans bl ON bl.book_id = b.id 
        WHERE b.id IN ($placeholders) AND bl.status = 'active'
    ");
    $stmt->execute($book_ids);
    $loaned_books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($loaned_books)) {
        $titles = array_map(function($book) { return $book['title']; }, $loaned_books);
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Cannot delete books that are currently loaned out: ' . implode(', ', $titles)
        ]);
        exit;
    }
    
    // Validate book IDs exist
    $stmt = $db->prepare("SELECT id, title FROM books WHERE id IN ($placeholders)");
    $stmt->execute($book_ids);
    $existing_books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($existing_books) !== count($book_ids)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Some books not found']);
        exit;
    }
    
    // Begin transaction for safe deletion
    $db->beginTransaction();
    
    try {
        // Delete related records first (foreign key constraints)
        
        // Delete book reviews
        $stmt = $db->prepare("DELETE FROM book_reviews WHERE book_id IN ($placeholders)");
        $stmt->execute($book_ids);
        
        // Delete reading history
        $stmt = $db->prepare("DELETE FROM reading_history WHERE book_id IN ($placeholders)");
        $stmt->execute($book_ids);
        
        // Delete reservations
        $stmt = $db->prepare("DELETE FROM book_reservations WHERE book_id IN ($placeholders)");
        $stmt->execute($book_ids);
        
        // Delete returned loans (keep active loans check above)
        $stmt = $db->prepare("DELETE FROM book_loans WHERE book_id IN ($placeholders) AND status != 'active'");
        $stmt->execute($book_ids);
        
        // Finally delete the books
        $stmt = $db->prepare("DELETE FROM books WHERE id IN ($placeholders)");
        $stmt->execute($book_ids);
        $deleted_count = $stmt->rowCount();
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "Successfully deleted $deleted_count books",
            'deleted_count' => $deleted_count
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>