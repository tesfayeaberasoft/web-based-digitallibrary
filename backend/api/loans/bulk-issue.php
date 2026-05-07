<?php
/**
 * Bulk Issue Books API
 * POST /api/loans/bulk-issue
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can bulk issue books
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['book_ids']) || !is_array($data['book_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID and book IDs array are required']);
        exit;
    }
    
    if (empty($data['book_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one book ID is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Validate user
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ? OR user_id = ?");
    $stmt->execute([$data['user_id'], $data['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    if ($user['status'] !== 'active') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User account is not active']);
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
    
    // Check current active loans
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user['id']]);
    $current_loans = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $max_books = 5; // Default limit
    $available_slots = $max_books - $current_loans;
    
    if (count($data['book_ids']) > $available_slots) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Cannot issue " . count($data['book_ids']) . " books. User has $current_loans active loans, only $available_slots slots available (limit: $max_books)"
        ]);
        exit;
    }
    
    // Validate all books and check availability
    $book_placeholders = str_repeat('?,', count($data['book_ids']) - 1) . '?';
    $stmt = $db->prepare("SELECT * FROM books WHERE id IN ($book_placeholders) AND status = 'active'");
    $stmt->execute($data['book_ids']);
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($books) !== count($data['book_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'One or more books not found or not available']);
        exit;
    }
    
    // Check if user already has any of these books
    $stmt = $db->prepare("SELECT book_id FROM book_loans WHERE user_id = ? AND book_id IN ($book_placeholders) AND status = 'active'");
    $params = array_merge([$user['id']], $data['book_ids']);
    $stmt->execute($params);
    $existing_loans = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($existing_loans)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'User already has some of these books: ' . implode(', ', $existing_loans)
        ]);
        exit;
    }
    
    // Check book availability
    $unavailable_books = [];
    foreach ($books as $book) {
        if ($book['available_copies'] <= 0) {
            $unavailable_books[] = $book['title'];
        }
    }
    
    if (!empty($unavailable_books)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No copies available for: ' . implode(', ', $unavailable_books)
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        $borrow_days = $data['borrow_days'] ?? 14;
        $due_date = date('Y-m-d', strtotime("+$borrow_days days"));
        $issued_books = [];
        $loan_ids = [];
        
        foreach ($books as $book) {
            // Create loan
            $stmt = $db->prepare("
                INSERT INTO book_loans (user_id, book_id, issued_by, loan_date, due_date, status)
                VALUES (?, ?, ?, CURDATE(), ?, 'active')
            ");
            $stmt->execute([$user['id'], $book['id'], $decoded['user_id'], $due_date]);
            $loan_id = $db->lastInsertId();
            $loan_ids[] = $loan_id;
            
            // Update book availability
            $stmt = $db->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
            $stmt->execute([$book['id']]);
            
            $issued_books[] = [
                'id' => $book['id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'isbn' => $book['isbn'],
                'loan_id' => $loan_id
            ];
        }
        
        // Create bulk notification for user
        $book_titles = array_column($issued_books, 'title');
        $book_list = implode(', ', array_slice($book_titles, 0, 3));
        if (count($book_titles) > 3) {
            $book_list .= ' and ' . (count($book_titles) - 3) . ' more';
        }
        
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'loan', 'Books Issued', ?)
        ");
        $message = "You have successfully borrowed " . count($issued_books) . " books: $book_list. Due date: $due_date";
        $stmt->execute([$user['id'], $message]);
        
        // Log activity
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, new_values)
            VALUES (?, 'bulk_issue_books', 'book_loans', ?, ?, ?)
        ");
        $audit_data = json_encode([
            'user_id' => $user['id'],
            'book_count' => count($issued_books),
            'loan_ids' => $loan_ids,
            'due_date' => $due_date
        ]);
        $stmt->execute([$decoded['user_id'], $loan_ids[0], $_SERVER['REMOTE_ADDR'], $audit_data]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Successfully issued ' . count($issued_books) . ' books',
            'issued_count' => count($issued_books),
            'due_date' => $due_date,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'user_id' => $user['user_id']
            ],
            'books' => $issued_books,
            'loan_ids' => $loan_ids
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