<?php
/**
 * Pay Fine
 * PUT /api/fines/{id}/pay
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
    
    $fine_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($fine_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid fine ID']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get fine details
    $stmt = $db->prepare("
        SELECT f.*, u.full_name as user_name
        FROM fines f
        JOIN users u ON f.user_id = u.id
        WHERE f.id = ?
    ");
    $stmt->execute([$fine_id]);
    $fine = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$fine) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fine not found']);
        exit;
    }
    
    // Users can only pay their own fines
    if ($decoded->role === 'user' && $fine['user_id'] != $decoded->user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    // Check if already paid
    if ($fine['status'] === 'paid') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fine already paid']);
        exit;
    }
    
    // Update fine status
    $payment_method = $data['payment_method'] ?? 'cash';
    $transaction_id = $data['transaction_id'] ?? null;
    
    $stmt = $db->prepare("
        UPDATE fines 
        SET status = 'paid', 
            paid_date = NOW(),
            payment_method = ?,
            transaction_id = ?
        WHERE id = ?
    ");
    $stmt->execute([$payment_method, $transaction_id, $fine_id]);
    
    // Create notification
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'payment', 'Fine Paid', ?)
    ");
    $message = "Your fine of $" . $fine['amount'] . " has been paid successfully";
    $stmt->execute([$fine['user_id'], $message]);
    
    // Log activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
        VALUES (?, 'pay_fine', 'fine', ?, ?)
    ");
    $stmt->execute([$decoded->user_id, $fine_id, $_SERVER['REMOTE_ADDR']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Fine paid successfully',
        'fine' => [
            'id' => $fine_id,
            'amount' => $fine['amount'],
            'status' => 'paid',
            'paid_date' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
