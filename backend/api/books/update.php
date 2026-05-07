<?php
/**
 * Update Book
 * PUT /api/books/{id}
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    
    $decoded = requireAuth();
    
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $book_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($book_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Check if book exists
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ?");
    $stmt->execute([$book_id]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    $allowed_fields = ['title', 'author', 'isbn', 'publisher', 'publication_year', 
                       'category_id', 'description', 'language', 'pages', 
                       'total_copies', 'status'];
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
            
            // Update available_copies if total_copies changed
            if ($field === 'total_copies') {
                $diff = $data[$field] - $book['total_copies'];
                $updates[] = "available_copies = available_copies + ?";
                $params[] = $diff;
            }
        }
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }
    
    $params[] = $book_id;
    $sql = "UPDATE books SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Log activity (using correct column names: table_name and record_id)
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
        VALUES (?, 'update_book', 'books', ?, ?)
    ");
    $stmt->execute([$decoded['user_id'], $book_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
