<?php
/**
 * Delete Book
 * DELETE /api/books/{id}
 */

header('Content-Type: application/json');

try {
    // Verify JWT token
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No token provided']);
        exit;
    }
    
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = JWT::decode($token);
    
    // Only admin can delete books
    if (!$decoded || $decoded->role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only admins can delete books']);
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
    
    // Soft delete - mark as deleted
    $stmt = $db->prepare("UPDATE books SET status = 'deleted', deleted_at = NOW() WHERE id = ?");
    $stmt->execute([$book_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'delete', 'book', ?, ?)
    ");
    $stmt->execute([$decoded->user_id, $book_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book deleted successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
