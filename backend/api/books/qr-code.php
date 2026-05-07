<?php
/**
 * Generate QR Code for Book
 * GET /api/books/{id}/qr-code
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can generate QR codes
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
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
    
    // Get book information
    $stmt = $db->prepare("
        SELECT 
            b.id,
            b.title,
            b.author,
            b.isbn,
            b.publisher,
            b.publication_year,
            c.name as category_name,
            b.description,
            b.language,
            b.pages,
            b.total_copies,
            b.available_copies,
            b.status
        FROM books b
        LEFT JOIN categories c ON c.id = b.category_id
        WHERE b.id = ?
    ");
    
    $stmt->execute([$book_id]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Create QR code data
    $qr_data = [
        'type' => 'book',
        'id' => $book['id'],
        'title' => $book['title'],
        'author' => $book['author'],
        'isbn' => $book['isbn'],
        'category' => $book['category_name'],
        'library' => 'Digital Library System',
        'url' => "http://localhost:3000/book/{$book['id']}", // Frontend book detail URL
        'generated_at' => date('Y-m-d H:i:s')
    ];
    
    // Return QR data for frontend generation
    echo json_encode([
        'success' => true,
        'book' => $book,
        'qr_data' => json_encode($qr_data),
        'qr_text' => "Book: {$book['title']} by {$book['author']} (ISBN: {$book['isbn']})"
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>