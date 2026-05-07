<?php
/**
 * Cancel Reservation API
 * DELETE /api/reservations/{id}/cancel
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    $reservation_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($reservation_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid reservation ID']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get reservation details
    $stmt = $db->prepare("
        SELECT r.*, b.title as book_title, u.full_name as user_name, u.email as user_email
        FROM book_reservations r
        JOIN books b ON r.book_id = b.id
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$reservation_id]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$reservation) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Reservation not found']);
        exit;
    }
    
    // Check permissions
    $can_cancel = false;
    if (in_array($decoded['role'], ['librarian', 'admin'])) {
        $can_cancel = true;
    } elseif ($decoded['role'] === 'user' && $decoded['user_id'] == $reservation['user_id']) {
        $can_cancel = true;
    }
    
    if (!$can_cancel) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    if ($reservation['status'] !== 'pending') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Only pending reservations can be cancelled']);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Cancel the reservation
        $stmt = $db->prepare("
            UPDATE book_reservations 
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$reservation_id]);
        
        // Reorder remaining queue positions for this book
        $stmt = $db->prepare("
            SELECT id FROM book_reservations 
            WHERE book_id = ? AND status = 'pending' AND id != ?
            ORDER BY 
                CASE 
                    WHEN queue_position IS NULL THEN created_at
                    ELSE queue_position
                END ASC,
                created_at ASC
        ");
        $stmt->execute([$reservation['book_id'], $reservation_id]);
        $remaining_reservations = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Update queue positions
        foreach ($remaining_reservations as $position => $res_id) {
            $stmt = $db->prepare("
                UPDATE book_reservations 
                SET queue_position = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$position + 1, $res_id]);
        }
        
        // Create notification for user
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'reservation', 'Reservation Cancelled', ?)
        ");
        $cancelled_by = ($decoded['role'] === 'user') ? 'You' : 'Library staff';
        $message = "$cancelled_by cancelled your reservation for '{$reservation['book_title']}'";
        $stmt->execute([$reservation['user_id'], $message]);
        
        // Log the cancellation
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, new_values)
            VALUES (?, 'cancel_reservation', 'book_reservations', ?, ?, ?)
        ");
        $audit_data = json_encode([
            'reservation_id' => $reservation_id,
            'book_title' => $reservation['book_title'],
            'user_name' => $reservation['user_name'],
            'cancelled_by' => $decoded['user_id'],
            'cancelled_by_role' => $decoded['role']
        ]);
        $stmt->execute([$decoded['user_id'], $reservation_id, $_SERVER['REMOTE_ADDR'], $audit_data]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Reservation cancelled successfully',
            'reservation_id' => $reservation_id,
            'book_title' => $reservation['book_title'],
            'user_name' => $reservation['user_name']
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