<?php
/**
 * Create New Book
 * POST /api/books
 */

header('Content-Type: application/json');

$uploadedEbook = null;

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../utils/ebook-storage.php';
    
    $decoded = requireAuth();
    
    // Check if user is admin or librarian
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Keep the JSON API compatible while allowing multipart eBook uploads.
    $data = !empty($_POST)
        ? $_POST
        : json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new EbookUploadException('Book details are required.');
    }
    
    // Validate required fields
    $required = ['title', 'author', 'isbn', 'category_id', 'total_copies'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }

    $totalCopies = filter_var($data['total_copies'], FILTER_VALIDATE_INT);
    $categoryId = filter_var($data['category_id'], FILTER_VALIDATE_INT);
    $pagesInput = trim((string)($data['pages'] ?? ''));
    $pages = $pagesInput === '' ? null : filter_var($pagesInput, FILTER_VALIDATE_INT);
    $yearInput = trim((string)($data['publication_year'] ?? ''));
    $publicationYear = $yearInput === '' ? null : filter_var($yearInput, FILTER_VALIDATE_INT);
    $conditionStatus = $data['condition_status'] ?? 'good';

    if ($totalCopies === false || $totalCopies < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Total copies must be a positive whole number.']);
        exit;
    }
    if ($categoryId === false || $categoryId < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Select a valid book category.']);
        exit;
    }
    if ($pagesInput !== '' && ($pages === false || $pages < 1)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Pages must be a positive whole number.']);
        exit;
    }
    if ($yearInput !== '' && ($publicationYear === false || $publicationYear < 1901 || $publicationYear > 2155)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Enter a valid publication year.']);
        exit;
    }
    if (!in_array($conditionStatus, ['new', 'good', 'fair', 'poor', 'damaged'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Select a valid book condition.']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }
    
    // Check if ISBN already exists
    $stmt = $db->prepare("SELECT id FROM books WHERE isbn = ?");
    $stmt->execute([$data['isbn']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Book with this ISBN already exists']);
        exit;
    }

    $uploadedEbook = storeEbookUpload($_FILES['ebook_file'] ?? null);
    
    $db->beginTransaction();
    
    // Insert book record
    $stmt = $db->prepare("
        INSERT INTO books (
            title, author, isbn, cover_image, publisher, publication_year,
            category_id, description, language, pages,
            total_copies, available_copies, status, condition_status, file_path, file_type,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, NOW(), NOW())
    ");
    
    $available_copies = $totalCopies;
    
    $success = $stmt->execute([
        $data['title'],
        $data['author'],
        $data['isbn'],
        $data['cover_image'] ?? null,
        $data['publisher'] ?? null,
        $publicationYear,
        $categoryId,
        $data['description'] ?? null,
        $data['language'] ?? 'English',
        $pages,
        $totalCopies,
        $available_copies,
        $conditionStatus,
        $uploadedEbook['path'] ?? null,
        $uploadedEbook['type'] ?? 'physical'
    ]);
    
    if (!$success) {
        throw new Exception('Failed to insert book record');
    }
    
    $book_id = $db->lastInsertId();
    
    if (!$book_id || $book_id == 0) {
        $db->rollBack();
        throw new Exception('Failed to retrieve book ID after insert - database may not support auto-increment or INSERT failed silently');
    }
    
    // Log activity (using correct column names: table_name and record_id)
    try {
        // Check if audit_logs table has created_at column
        $checkColumn = $db->query("SHOW COLUMNS FROM audit_logs LIKE 'created_at'");
        $hasCreatedAt = $checkColumn->rowCount() > 0;
        
        if ($hasCreatedAt) {
            $stmt = $db->prepare("
                INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, created_at)
                VALUES (?, 'create_book', 'books', ?, ?, NOW())
            ");
        } else {
            $stmt = $db->prepare("
                INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
                VALUES (?, 'create_book', 'books', ?, ?)
            ");
        }
        $stmt->execute([$decoded['user_id'], $book_id, $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0']);
    } catch (Exception $logError) {
        // Log the error but don't fail the entire operation
        error_log('Failed to create audit log: ' . $logError->getMessage());
    }
    
    $db->commit();
    
    // Verify the book was actually created
    $stmt = $db->prepare("SELECT id, title, isbn FROM books WHERE id = ?");
    $stmt->execute([$book_id]);
    $verifyBook = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$verifyBook) {
        throw new Exception('Book creation verification failed');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Book created successfully',
        'book_id' => $book_id,
        'book' => $verifyBook
    ]);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    if ($uploadedEbook !== null) {
        deleteStoredEbook($uploadedEbook['path']);
    }
    if ($e instanceof EbookUploadException) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
    error_log('Book creation failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Book could not be created.'
    ]);
}
?>
