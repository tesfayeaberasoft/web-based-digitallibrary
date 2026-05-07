<?php
/**
 * Reservation Queue Management API
 * GET /api/reservations/queue-management
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can manage queues
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get books with pending reservations
    $stmt = $db->prepare("
        SELECT DISTINCT
            b.id as book_id,
            b.title,
            b.author,
            b.isbn,
            b.available_copies,
            b.total_copies,
            c.name as category_name,
            COUNT(r.id) as queue_count
        FROM books b
        JOIN book_reservations r ON b.id = r.book_id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE r.status = 'pending'
        GROUP BY b.id, b.title, b.author, b.isbn, b.available_copies, b.total_copies, c.name
        ORDER BY queue_count DESC, b.title ASC
    ");
    $stmt->execute();
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $result = [];
    
    foreach ($books as $book) {
        // Get reservations for this book ordered by queue position
        $stmt = $db->prepare("
            SELECT 
                r.id,
                r.user_id,
                r.queue_position,
                r.created_at,
                r.status,
                u.full_name as user_name,
                u.email as user_email,
                u.user_id as user_code,
                u.phone,
                (
                    SELECT COUNT(*)
                    FROM book_loans bl
                    WHERE bl.user_id = r.user_id AND bl.status = 'active'
                ) as active_loans,
                (
                    SELECT SUM(amount - paid_amount)
                    FROM fines f
                    WHERE f.user_id = r.user_id AND f.status = 'pending'
                ) as pending_fines
            FROM book_reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.book_id = ? AND r.status = 'pending'
            ORDER BY 
                CASE 
                    WHEN r.queue_position IS NULL THEN r.created_at
                    ELSE r.queue_position
                END ASC,
                r.created_at ASC
        ");
        $stmt->execute([$book['book_id']]);
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure queue positions are sequential
        foreach ($reservations as $index => $reservation) {
            $reservations[$index]['queue_position'] = $index + 1;
            $reservations[$index]['pending_fines'] = (float)($reservation['pending_fines'] ?? 0);
        }
        
        $result[] = [
            'book' => $book,
            'reservations' => $reservations
        ];
    }
    
    echo json_encode([
        'success' => true,
        'queue_data' => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>