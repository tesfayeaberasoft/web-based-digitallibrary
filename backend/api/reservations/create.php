<?php
/**
 * Create Book Reservation
 * POST /api/reservations
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
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['book_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book ID is required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    $user_id = $decoded->user_id;
    $book_id = $data['book_id'];
    
    // Check if book exists
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ?");
    $stmt->execute([$book_id]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found']);
        exit;
    }
    
    // Check if user already has this book on loan
    $stmt = $db->prepare("SELECT id FROM book_loans WHERE user_id = ? AND book_id = ? AND status = 'active'");
    $stmt->execute([$user_id, $book_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You already have this book']);
        exit;
    }
    
    // Check if user already has a pending reservation for this book
    $stmt = $db->prepare("SELECT id FROM book_reservations WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'available')");
    $stmt->execute([$user_id, $book_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You already have a reservation for this book']);
        exit;
    }
    
    // Create reservation
    $stmt = $db->prepare("
        INSERT INTO book_reservations (user_id, book_id, status)
        VALUES (?, ?, 'pending')
    ");
    $stmt->execute([$user_id, $book_id]);
    
    $reservation_id = $db->lastInsertId();
    
    // Get queue position
    $stmt = $db->prepare("
        SELECT COUNT(*) + 1 as position
        FROM book_reservations
        WHERE book_id = ? AND status = 'pending' AND id < ?
    ");
    $stmt->execute([$book_id, $reservation_id]);
    $position = $stmt->fetch(PDO::FETCH_ASSOC)['position'];
    
    // Create notification
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'reservation', 'Book Reserved', ?)
    ");
    $message = "You have successfully reserved '{$book['title']}'. Queue position: $position";
    $stmt->execute([$user_id, $message]);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'reserve_book', 'reservation', ?, ?)
    ");
    $stmt->execute([$user_id, $reservation_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Book reserved successfully',
        'reservation_id' => $reservation_id,
        'queue_position' => $position
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
