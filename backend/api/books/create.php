<?php
/**
 * Create New Book
 * POST /api/books
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
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit;
    }
    
    // Check if user is admin or librarian
    if (!in_array($decoded->role, ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['title', 'author', 'isbn', 'category_id', 'total_copies'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
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
            total_copies, available_copies, location, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
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
        $available_copies,
        $data['location'] ?? 'Main Library'
    ]);
    
    $book_id = $db->lastInsertId();
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'create', 'book', ?, ?)
    ");
    $stmt->execute([$decoded->user_id, $book_id, $_SERVER['REMOTE_ADDR']]);
    
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
