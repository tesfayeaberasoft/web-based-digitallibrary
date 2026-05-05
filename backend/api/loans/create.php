<?php
/**
 * Issue Book (Create Loan)
 * POST /api/loans
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../config/config.php';
    
    $decoded = requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['book_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing book_id']);
        exit;
    }
    
    // Use user_id from JWT token (more secure)
    $user_id = $decoded['user_id'];
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Check if book is available
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ? AND status = 'active'");
    $stmt->execute([$data['book_id']]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found or unavailable']);
        exit;
    }
    
    if ($book['available_copies'] <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No copies available']);
        exit;
    }
    
    // Check user's active loans count
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get max books per user from settings (default 5)
    $max_books = 5;
    
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
    $stmt->execute([$user_id, $data['book_id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User already has this book']);
        exit;
    }
    
    // Get borrow duration from settings (default 14 days)
    $borrow_days = $data['borrow_days'] ?? 14;
    $due_date = date('Y-m-d', strtotime("+$borrow_days days"));
    
    // Create loan
    $stmt = $db->prepare("
        INSERT INTO book_loans (user_id, book_id, issued_by, loan_date, due_date, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'active')
    ");
    
    $stmt->execute([
        $user_id,
        $data['book_id'],
        $decoded['user_id'],
        $due_date
    ]);
    
    $loan_id = $db->lastInsertId();
    
    // Update book availability
    $stmt = $db->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
    $stmt->execute([$data['book_id']]);
    
    // Create notification for user
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'loan', 'Book Issued', ?)
    ");
    $message = "You have successfully borrowed '{$book['title']}'. Due date: $due_date";
    $stmt->execute([$user_id, $message]);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'issue_book', 'loan', ?, ?)
    ");
    $stmt->execute([$decoded['user_id'], $loan_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book issued successfully',
        'loan_id' => $loan_id,
        'due_date' => $due_date
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
