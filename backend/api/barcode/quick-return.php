<?php
/**
 * Quick Return Book via Barcode
 * POST /api/barcode/quick-return
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can process returns
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['book_barcode'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book barcode is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Find book by barcode
    $stmt = $db->prepare("SELECT * FROM books WHERE isbn = ? OR id = ?");
    $stmt->execute([$data['book_barcode'], $data['book_barcode']]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found with barcode: ' . $data['book_barcode']]);
        exit;
    }
    
    // Find active loan for this book
    $stmt = $db->prepare("
        SELECT l.*, u.full_name as user_name, u.user_id as user_code, u.email as user_email
        FROM book_loans l
        JOIN users u ON l.user_id = u.id
        WHERE l.book_id = ? AND l.status = 'active'
        ORDER BY l.loan_date DESC
        LIMIT 1
    ");
    $stmt->execute([$book['id']]);
    $loan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$loan) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No active loan found for this book']);
        exit;
    }
    
    // If user barcode is provided, verify it matches the loan
    if (isset($data['user_barcode']) && !empty($data['user_barcode'])) {
        if ($loan['user_code'] !== $data['user_barcode'] && $loan['user_id'] != $data['user_barcode']) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'User barcode does not match the borrower of this book'
            ]);
            exit;
        }
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        $return_date = date('Y-m-d');
        $due_date = $loan['due_date'];
        
        // Calculate fine if overdue
        $fine_amount = 0;
        $fine_per_day = 5; // Default fine per day
        $days_overdue = 0;
        
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
        $stmt->execute([$return_date, $decoded['user_id'], $loan['id']]);
        
        // Update book availability
        $stmt = $db->prepare("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?");
        $stmt->execute([$book['id']]);
        
        $fine_id = null;
        
        // Create fine record if overdue
        if ($fine_amount > 0) {
            $stmt = $db->prepare("
                INSERT INTO fines (user_id, loan_id, fine_type, amount, description, status)
                VALUES (?, ?, 'overdue', ?, 'Overdue return via barcode scan', 'pending')
            ");
            $stmt->execute([$loan['user_id'], $loan['id'], $fine_amount]);
            $fine_id = $db->lastInsertId();
            
            // Notify user about fine
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, type, title, message)
                VALUES (?, 'fine_notice', 'Overdue Fine', ?)
            ");
            $fine_message = "You have a fine of $" . number_format($fine_amount, 2) . " for late return of '{$book['title']}'";
            $stmt->execute([$loan['user_id'], $fine_message]);
        }
        
        // Notify user about successful return
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'general', 'Book Returned', ?)
        ");
        $return_message = "You have successfully returned '{$book['title']}'";
        $stmt->execute([$loan['user_id'], $return_message]);
        
        // Check if anyone has reserved this book
        $stmt = $db->prepare("
            SELECT r.*, u.full_name as user_name
            FROM book_reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.book_id = ? AND r.status = 'pending'
            ORDER BY r.created_at ASC
            LIMIT 1
        ");
        $stmt->execute([$book['id']]);
        $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($reservation) {
            // Notify user that book is available
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, type, title, message)
                VALUES (?, 'reservation_available', 'Reserved Book Available', ?)
            ");
            $reservation_message = "Your reserved book '{$book['title']}' is now available for pickup";
            $stmt->execute([$reservation['user_id'], $reservation_message]);
            
            // Update reservation status
            $stmt = $db->prepare("UPDATE book_reservations SET status = 'available' WHERE id = ?");
            $stmt->execute([$reservation['id']]);
        }
        
        // Log activity
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
            VALUES (?, 'quick_return_book', 'book_loans', ?, ?)
        ");
        $stmt->execute([$decoded['user_id'], $loan['id'], $_SERVER['REMOTE_ADDR']]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Book returned successfully via barcode scan',
            'loan_id' => $loan['id'],
            'fine_amount' => $fine_amount,
            'days_overdue' => $days_overdue,
            'fine_id' => $fine_id,
            'user' => [
                'id' => $loan['user_id'],
                'name' => $loan['user_name'],
                'user_id' => $loan['user_code'],
                'email' => $loan['user_email']
            ],
            'book' => [
                'id' => $book['id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'isbn' => $book['isbn']
            ],
            'reservation_info' => $reservation ? [
                'next_user' => $reservation['user_name'],
                'notification_sent' => true
            ] : null
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