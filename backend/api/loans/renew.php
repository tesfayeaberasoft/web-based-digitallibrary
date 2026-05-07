<?php
/**
 * Renew Book Loan
 * PUT /api/loans/{id}/renew
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
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
        SELECT l.*, b.title as book_title
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
    
    // Check if user owns this loan
    if ($decoded['role'] === 'user' && $decoded['user_id'] != $loan['user_id']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Check renewal limit (max 2 renewals)
    $max_renewals = 2;
    if ($loan['renewal_count'] >= $max_renewals) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Maximum renewal limit reached. You can only renew a book $max_renewals times."
        ]);
        exit;
    }
    
    // Check if book is overdue
    $today = date('Y-m-d');
    if ($today > $loan['due_date']) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Cannot renew overdue books. Please return the book and pay any fines.'
        ]);
        exit;
    }
    
    // Check if book has pending reservations
    $stmt = $db->prepare("
        SELECT COUNT(*) as reservation_count
        FROM book_reservations
        WHERE book_id = ? AND status = 'pending'
    ");
    $stmt->execute([$loan['book_id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['reservation_count'] > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Cannot renew. This book has pending reservations from other users.'
        ]);
        exit;
    }
    
    // Calculate new due date (extend by 14 days)
    $renewal_period = 14; // days
    $current_due_date = new DateTime($loan['due_date']);
    $new_due_date = $current_due_date->modify("+$renewal_period days");
    $new_due_date_str = $new_due_date->format('Y-m-d');
    
    // Update loan with new due date and increment renewal count
    $stmt = $db->prepare("
        UPDATE book_loans 
        SET due_date = ?, 
            renewal_count = renewal_count + 1,
            status = 'renewed'
        WHERE id = ?
    ");
    $stmt->execute([$new_due_date_str, $loan_id]);
    
    // Send notification to user
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'general', 'Book Renewed', ?)
    ");
    $renewal_message = "You have successfully renewed '{$loan['book_title']}'. New due date: " . $new_due_date->format('F j, Y');
    $stmt->execute([$loan['user_id'], $renewal_message]);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
        VALUES (?, 'renew_book', 'book_loans', ?, ?)
    ");
    $stmt->execute([$decoded['user_id'], $loan_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book renewed successfully',
        'new_due_date' => $new_due_date_str,
        'renewal_count' => $loan['renewal_count'] + 1,
        'renewals_remaining' => $max_renewals - ($loan['renewal_count'] + 1)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
