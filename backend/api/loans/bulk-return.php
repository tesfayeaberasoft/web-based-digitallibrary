<?php
/**
 * Bulk Return Books API
 * POST /api/loans/bulk-return
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can bulk return books
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['loan_ids']) || !is_array($data['loan_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Loan IDs array is required']);
        exit;
    }
    
    if (empty($data['loan_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one loan ID is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Validate all loans
    $loan_placeholders = str_repeat('?,', count($data['loan_ids']) - 1) . '?';
    $stmt = $db->prepare("
        SELECT l.*, b.title as book_title, b.id as book_id, u.full_name as user_name, u.user_id as user_code
        FROM book_loans l
        JOIN books b ON l.book_id = b.id
        JOIN users u ON l.user_id = u.id
        WHERE l.id IN ($loan_placeholders) AND l.status = 'active'
    ");
    $stmt->execute($data['loan_ids']);
    $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($loans) !== count($data['loan_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'One or more active loans not found']);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        $return_date = date('Y-m-d');
        $fine_per_day = 5; // Default fine per day
        $returned_books = [];
        $total_fine = 0;
        $fine_ids = [];
        $user_notifications = [];
        
        foreach ($loans as $loan) {
            $due_date = $loan['due_date'];
            $fine_amount = 0;
            $days_overdue = 0;
            
            // Calculate fine if overdue
            if ($return_date > $due_date) {
                $days_overdue = (strtotime($return_date) - strtotime($due_date)) / (60 * 60 * 24);
                $fine_amount = $days_overdue * $fine_per_day;
                $total_fine += $fine_amount;
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
            $stmt->execute([$loan['book_id']]);
            
            // Create fine record if overdue
            if ($fine_amount > 0) {
                $stmt = $db->prepare("
                    INSERT INTO fines (user_id, loan_id, fine_type, amount, description, status)
                    VALUES (?, ?, 'overdue', ?, 'Overdue return (bulk operation)', 'pending')
                ");
                $stmt->execute([$loan['user_id'], $loan['id'], $fine_amount]);
                $fine_ids[] = $db->lastInsertId();
            }
            
            // Check for reservations
            $stmt = $db->prepare("
                SELECT r.*, u.full_name as user_name
                FROM book_reservations r
                JOIN users u ON r.user_id = u.id
                WHERE r.book_id = ? AND r.status = 'pending'
                ORDER BY r.created_at ASC
                LIMIT 1
            ");
            $stmt->execute([$loan['book_id']]);
            $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $reservation_info = null;
            if ($reservation) {
                // Notify user that book is available
                $stmt = $db->prepare("
                    INSERT INTO notifications (user_id, type, title, message)
                    VALUES (?, 'reservation_available', 'Reserved Book Available', ?)
                ");
                $reservation_message = "Your reserved book '{$loan['book_title']}' is now available for pickup";
                $stmt->execute([$reservation['user_id'], $reservation_message]);
                
                // Update reservation status
                $stmt = $db->prepare("UPDATE book_reservations SET status = 'available' WHERE id = ?");
                $stmt->execute([$reservation['id']]);
                
                $reservation_info = [
                    'user_name' => $reservation['user_name'],
                    'user_id' => $reservation['user_id']
                ];
            }
            
            $returned_books[] = [
                'loan_id' => $loan['id'],
                'book_id' => $loan['book_id'],
                'book_title' => $loan['book_title'],
                'user_name' => $loan['user_name'],
                'user_id' => $loan['user_id'],
                'due_date' => $due_date,
                'days_overdue' => $days_overdue,
                'fine_amount' => $fine_amount,
                'reservation_info' => $reservation_info
            ];
            
            // Group notifications by user
            if (!isset($user_notifications[$loan['user_id']])) {
                $user_notifications[$loan['user_id']] = [
                    'user_name' => $loan['user_name'],
                    'books' => [],
                    'total_fine' => 0
                ];
            }
            $user_notifications[$loan['user_id']]['books'][] = $loan['book_title'];
            $user_notifications[$loan['user_id']]['total_fine'] += $fine_amount;
        }
        
        // Send notifications to users
        foreach ($user_notifications as $user_id => $notification_data) {
            $book_list = implode(', ', array_slice($notification_data['books'], 0, 3));
            if (count($notification_data['books']) > 3) {
                $book_list .= ' and ' . (count($notification_data['books']) - 3) . ' more';
            }
            
            // Return notification
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, type, title, message)
                VALUES (?, 'general', 'Books Returned', ?)
            ");
            $return_message = "You have successfully returned " . count($notification_data['books']) . " books: $book_list";
            $stmt->execute([$user_id, $return_message]);
            
            // Fine notification if applicable
            if ($notification_data['total_fine'] > 0) {
                $stmt = $db->prepare("
                    INSERT INTO notifications (user_id, type, title, message)
                    VALUES (?, 'fine_notice', 'Overdue Fine', ?)
                ");
                $fine_message = "You have a total fine of $" . number_format($notification_data['total_fine'], 2) . " for late returns";
                $stmt->execute([$user_id, $fine_message]);
            }
        }
        
        // Log activity
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, new_values)
            VALUES (?, 'bulk_return_books', 'book_loans', ?, ?, ?)
        ");
        $audit_data = json_encode([
            'loan_count' => count($returned_books),
            'loan_ids' => $data['loan_ids'],
            'total_fine' => $total_fine,
            'fine_ids' => $fine_ids
        ]);
        $stmt->execute([$decoded['user_id'], $data['loan_ids'][0], $_SERVER['REMOTE_ADDR'], $audit_data]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Successfully returned ' . count($returned_books) . ' books',
            'returned_count' => count($returned_books),
            'total_fine' => $total_fine,
            'books' => $returned_books,
            'fine_ids' => $fine_ids,
            'summary' => [
                'total_books' => count($returned_books),
                'overdue_books' => count(array_filter($returned_books, fn($book) => $book['days_overdue'] > 0)),
                'total_fine' => $total_fine,
                'reservations_notified' => count(array_filter($returned_books, fn($book) => $book['reservation_info'] !== null))
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