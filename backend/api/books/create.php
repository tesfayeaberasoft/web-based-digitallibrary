<?php
/**
 * Create New Book
 * POST /api/books
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    
    $decoded = requireAuth();
    
    // Check if user is admin or librarian
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['title', 'author', 'isbn', 'category_id', 'total_copies'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Check if ISBN already exists
    $stmt = $db->prepare("SELECT id FROM books WHERE isbn = ?");
    $stmt->execute([$data['isbn']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Book with this ISBN already exists']);
        exit;
    }
    
    // Insert book
    $stmt = $db->prepare("
        INSERT INTO books (
            title, author, isbn, publisher, publication_year,
            category_id, description, language, pages,
            total_copies, available_copies, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    ");
    
    $available_copies = $data['total_copies'];
    
    $stmt->execute([
        $data['title'],
        $data['author'],
        $data['isbn'],
        $data['publisher'] ?? null,
        $data['publication_year'] ?? null,
        $data['category_id'],
        $data['description'] ?? null,
        $data['language'] ?? 'English',
        $data['pages'] ?? null,
        $data['total_copies'],
        $available_copies
    ]);
    
    $book_id = $db->lastInsertId();
    
    // Log activity (using correct column names: table_name and record_id)
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
        VALUES (?, 'create_book', 'books', ?, ?)
    ");
    $stmt->execute([$decoded['user_id'], $book_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book created successfully',
        'book_id' => $book_id
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
