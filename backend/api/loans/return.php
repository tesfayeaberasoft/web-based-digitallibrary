<?php
/**
 * Return Book
 * PUT /api/loans/{id}/return
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
    
    $loan_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($loan_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid loan ID']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get loan details
    $stmt = $db->prepare("
        SELECT l.*, b.title as book_title, b.id as book_id
        FROM book_loans l
        JOIN books b ON l.book_id = b.id
        WHERE l.id = ? AND l.status = 'active'
    ");
    $stmt->execute([$loan_id]);
    $loan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$loan) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Active loan not found']);
        exit;
    }
    
    $return_date = date('Y-m-d');
    $due_date = $loan['due_date'];
    
    // Calculate fine if overdue
    $fine_amount = 0;
    $fine_per_day = 5; // Default fine per day
    
    if ($return_date > $due_date) {
        $days_overdue = (strtotime($return_date) - strtotime($due_date)) / (60 * 60 * 24);
        $fine_amount = $days_overdue * $fine_per_day;
    }
    
    // Update loan status
    $stmt = $db->prepare("
        UPDATE book_loans 
        SET status = 'returned', 
            return_date = ?, 
            returned_to = ?
        WHERE id = ?
    ");
    $stmt->execute([$return_date, $decoded->user_id, $loan_id]);
    
    // Update book availability
    $stmt = $db->prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?");
    $stmt->execute([$loan['book_id']]);
    
    // Create fine record if overdue
    if ($fine_amount > 0) {
        $stmt = $db->prepare("
            INSERT INTO fines (user_id, loan_id, amount, reason, status)
            VALUES (?, ?, ?, 'Overdue return', 'pending')
        ");
        $stmt->execute([$loan['user_id'], $loan_id, $fine_amount]);
        
        // Notify user about fine
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'fine', 'Overdue Fine', ?)
        ");
        $message = "You have a fine of $$fine_amount for late return of '{$loan['book_title']}'";
        $stmt->execute([$loan['user_id'], $message]);
    }
    
    // Notify user about successful return
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'return', 'Book Returned', ?)
    ");
    $message = "You have successfully returned '{$loan['book_title']}'";
    $stmt->execute([$loan['user_id'], $message]);
    
    // Check if anyone has reserved this book
    $stmt = $db->prepare("
        SELECT * FROM book_reservations 
        WHERE book_id = ? AND status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
    ");
    $stmt->execute([$loan['book_id']]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($reservation) {
        // Notify user that book is available
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'reservation', 'Reserved Book Available', ?)
        ");
        $message = "Your reserved book '{$loan['book_title']}' is now available for pickup";
        $stmt->execute([$reservation['user_id'], $message]);
        
        // Update reservation status
        $stmt = $db->prepare("UPDATE book_reservations SET status = 'available' WHERE id = ?");
        $stmt->execute([$reservation['id']]);
    }
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'return_book', 'loan', ?, ?)
    ");
    $stmt->execute([$decoded->user_id, $loan_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book returned successfully',
        'fine_amount' => $fine_amount
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
