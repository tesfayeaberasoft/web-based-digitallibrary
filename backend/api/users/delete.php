<?php
/**
 * Delete User API (Admin only)
 * DELETE /api/users/{id}
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins can delete users
    if ($decoded['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get user ID from URL or request body
    $user_id = $_GET['id'] ?? null;
    if (!$user_id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = $input['id'] ?? null;
    }
    
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    // Check if user exists
    $stmt = $db->prepare("SELECT id, full_name, email, role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Prevent admin from deleting themselves
    if ($user_id == $decoded['user_id']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot delete your own account']);
        exit;
    }
    
    // Check if user has active loans
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM book_loans WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$user_id]);
    $active_loans = $stmt->fetch()['count'];
    
    if ($active_loans > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Cannot delete user with $active_loans active book loans. Please return all books first."
        ]);
        exit;
    }
    
    // Check if user has unpaid fines
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount - paid_amount), 0) as total FROM fines WHERE user_id = ? AND status != 'paid'");
    $stmt->execute([$user_id]);
    $unpaid_fines = $stmt->fetch()['total'];
    
    if ($unpaid_fines > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Cannot delete user with unpaid fines of $" . number_format($unpaid_fines, 2) . ". Please clear all fines first."
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Delete related records first (to maintain referential integrity)
        // Note: We'll set user_id to NULL for audit trail instead of deleting
        
        // Delete notifications
        $stmt = $db->prepare("DELETE FROM notifications WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete notification logs
        $stmt = $db->prepare("DELETE FROM notification_logs WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete notification settings
        $stmt = $db->prepare("DELETE FROM notification_settings WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete book reviews
        $stmt = $db->prepare("DELETE FROM book_reviews WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete reading history
        $stmt = $db->prepare("DELETE FROM reading_history WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete reading goals
        $stmt = $db->prepare("DELETE FROM reading_goals WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete user achievements
        $stmt = $db->prepare("DELETE FROM user_achievements WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete reservations
        $stmt = $db->prepare("DELETE FROM book_reservations WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Delete payment transactions
        $stmt = $db->prepare("DELETE FROM payment_transactions WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Set user_id to NULL for audit trail records (keep for history)
        $stmt = $db->prepare("UPDATE fines SET user_id = NULL WHERE user_id = ? AND status = 'paid'");
        $stmt->execute([$user_id]);
        
        $stmt = $db->prepare("UPDATE book_loans SET user_id = NULL WHERE user_id = ? AND status = 'returned'");
        $stmt->execute([$user_id]);
        
        $stmt = $db->prepare("UPDATE audit_logs SET user_id = NULL WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        // Finally delete the user
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $result = $stmt->execute([$user_id]);
        
        if ($result && $stmt->rowCount() > 0) {
            $db->commit();
            echo json_encode([
                'success' => true,
                'message' => "User '{$user['full_name']}' has been successfully deleted"
            ]);
        } else {
            throw new Exception('Failed to delete user');
        }
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>