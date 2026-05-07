<?php
/**
 * Quick Issue Book via Barcode
 * POST /api/barcode/quick-issue
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can issue books
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_barcode']) || !isset($data['book_barcode'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User and book barcodes are required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Find user by barcode
    $stmt = $db->prepare("SELECT * FROM users WHERE user_id = ? OR id = ?");
    $stmt->execute([$data['user_barcode'], $data['user_barcode']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found with barcode: ' . $data['user_barcode']]);
        exit;
    }
    
    if ($user['status'] !== 'active') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User account is not active']);
        exit;
    }
    
    // Find book by barcode
    $stmt = $db->prepare("SELECT * FROM books WHERE isbn = ? OR id = ?");
    $stmt->execute([$data['book_barcode'], $data['book_barcode']]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found with barcode: ' . $data['book_barcode']]);
        exit;
    }
    
    if ($book['status'] !== 'active') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book is not available for lending']);
        exit;
    }
    
    if ($book['available_copies'] <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No copies available for this book']);
        exit;
    }
    
    // Check user's active loans count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user['id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $max_books = 5; // Default limit
    if ($result['count'] >= $max_books) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "User has reached maximum loan limit ($max_books books)"
        ]);
        exit;
    }
    
    // Check if user already has this book
    $stmt = $db->prepare("SELECT id FROM book_loans WHERE user_id = ? AND book_id = ? AND status = 'active'");
    $stmt->execute([$user['id'], $book['id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User already has this book']);
        exit;
    }
    
    // Check for pending fines
    $stmt = $db->prepare("SELECT SUM(amount - paid_amount) as pending_fines FROM fines WHERE user_id = ? AND status = 'pending'");
    $stmt->execute([$user['id']]);
    $fine_result = $stmt->fetch(PDO::FETCH_ASSOC);
    $pending_fines = (float)($fine_result['pending_fines'] ?? 0);
    
    if ($pending_fines > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User has pending fines of $' . number_format($pending_fines, 2) . '. Please clear fines before issuing new books.'
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Get borrow duration (default 14 days)
        $borrow_days = $data['borrow_days'] ?? 14;
        $due_date = date('Y-m-d', strtotime("+$borrow_days days"));
        
        // Create loan
        $stmt = $db->prepare("
            INSERT INTO book_loans (user_id, book_id, issued_by, loan_date, due_date, status)
            VALUES (?, ?, ?, CURDATE(), ?, 'active')
        ");
        $stmt->execute([$user['id'], $book['id'], $decoded['user_id'], $due_date]);
        $loan_id = $db->lastInsertId();
        
        // Update book availability
        $stmt = $db->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
        $stmt->execute([$book['id']]);
        
        // Create notification for user
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'loan', 'Book Issued', ?)
        ");
        $message = "You have successfully borrowed '{$book['title']}'. Due date: $due_date";
        $stmt->execute([$user['id'], $message]);
        
        // Log activity
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
            VALUES (?, 'quick_issue_book', 'book_loans', ?, ?)
        ");
        $stmt->execute([$decoded['user_id'], $loan_id, $_SERVER['REMOTE_ADDR']]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Book issued successfully via barcode scan',
            'loan_id' => $loan_id,
            'due_date' => $due_date,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'user_id' => $user['user_id']
            ],
            'book' => [
                'id' => $book['id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'isbn' => $book['isbn']
            ]
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