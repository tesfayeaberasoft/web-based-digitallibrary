<?php
/**
 * Reorder Reservation Queue API
 * PUT /api/reservations/reorder-queue
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can reorder queues
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['book_id']) || !isset($data['reservation_order']) || !is_array($data['reservation_order'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book ID and reservation order array are required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Validate book exists
    $stmt = $db->prepare("SELECT id, title FROM books WHERE id = ?");
    $stmt->execute([$data['book_id']]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Validate all reservation IDs belong to this book and are pending
    $reservation_ids = $data['reservation_order'];
    $placeholders = str_repeat('?,', count($reservation_ids) - 1) . '?';
    
    $stmt = $db->prepare("
        SELECT id FROM book_reservations 
        WHERE id IN ($placeholders) AND book_id = ? AND status = 'pending'
    ");
    $params = array_merge($reservation_ids, [$data['book_id']]);
    $stmt->execute($params);
    $valid_reservations = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($valid_reservations) !== count($reservation_ids)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid reservation IDs provided']);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update queue positions
        foreach ($reservation_ids as $position => $reservation_id) {
            $stmt = $db->prepare("
                UPDATE book_reservations 
                SET queue_position = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$position + 1, $reservation_id]);
        }
        
        // Log the reorder activity
        $stmt = $db->prepare("
            INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, new_values)
            VALUES (?, 'reorder_reservation_queue', 'book_reservations', ?, ?, ?)
        ");
        $audit_data = json_encode([
            'book_id' => $data['book_id'],
            'book_title' => $book['title'],
            'new_order' => $reservation_ids,
            'reordered_by' => $decoded['user_id']
        ]);
        $stmt->execute([$decoded['user_id'], $data['book_id'], $_SERVER['REMOTE_ADDR'], $audit_data]);
        
        // Get updated reservation details for response
        $stmt = $db->prepare("
            SELECT 
                r.id,
                r.queue_position,
                u.full_name as user_name,
                u.email as user_email
            FROM book_reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.id IN ($placeholders)
            ORDER BY r.queue_position ASC
        ");
        $stmt->execute($reservation_ids);
        $updated_reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Reservation queue reordered successfully',
            'book_title' => $book['title'],
            'updated_reservations' => $updated_reservations
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