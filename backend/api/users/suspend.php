<?php
/**
 * Suspend/Activate User API (Admin only)
 * PUT /api/users/{id}/suspend
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins and super-admins can suspend/activate users
    if ($decoded['role'] !== 'admin' && $decoded['role'] !== 'super-admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/security-helper.php';
    $db = Database::getInstance()->getConnection();
    
    // Get user ID from URL or request body
    $user_id = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$user_id) {
        $user_id = $input['id'] ?? null;
    }
    
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    // Get action (suspend, activate, or toggle)
    $action = $input['action'] ?? 'toggle';
    $reason = $input['reason'] ?? '';
    
    // Check if user exists
    $stmt = $db->prepare("SELECT id, full_name, email, role, status FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Prevent admin from suspending themselves
    if ($user_id == $decoded['user_id']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot suspend your own account']);
        exit;
    }
    
    // Prevent suspending other admins (unless you're a super-admin)
    if ($user['role'] === 'admin' && $decoded['role'] !== 'super-admin') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot suspend admin accounts']);
        exit;
    }
    
    // Determine new status
    $current_status = $user['status'];
    $new_status = '';
    
    switch ($action) {
        case 'suspend':
            $new_status = 'suspended';
            break;
        case 'activate':
            $new_status = 'active';
            break;
        case 'toggle':
        default:
            $new_status = ($current_status === 'suspended') ? 'active' : 'suspended';
            break;
    }
    
    // Don't update if status is the same
    if ($current_status === $new_status) {
        echo json_encode([
            'success' => true,
            'message' => "User is already $new_status",
            'user' => $user
        ]);
        exit;
    }
    
    // Update user status
    $stmt = $db->prepare("UPDATE users SET status = ? WHERE id = ?");
    $result = $stmt->execute([$new_status, $user_id]);
    
    if ($result) {
        if ($new_status === 'suspended') {
            $stmt = $db->prepare("UPDATE book_reservations SET status = 'cancelled' WHERE user_id = ? AND status = 'pending'");
            $stmt->execute([$user_id]);
        }

        if ($new_status === 'active' && isRegularUserRole($user['role'])) {
            clearFailedLoginAttempts($db, null, $user['email']);
            if (securityTableHasColumn($db, 'users', 'suspension_reason')) {
                $stmt = $db->prepare("UPDATE users SET suspension_reason = NULL WHERE id = ?");
                $stmt->execute([$user_id]);
            }
        }
        
        // Get updated user data
        $stmt = $db->prepare("SELECT id, user_id, full_name, email, phone, role, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $updated_user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Create notification for the user
        $notification_title = ($new_status === 'suspended') ? 'Account Suspended' : 'Account Activated';
        $notification_message = ($new_status === 'suspended') 
            ? "Your account has been suspended. " . ($reason ? "Reason: $reason" : "Please contact the library for more information.")
            : "Your account has been reactivated. You can now access all library services.";
        
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message) 
            VALUES (?, 'general', ?, ?)
        ");
        $stmt->execute([$user_id, $notification_title, $notification_message]);
        
        $action_word = ($new_status === 'suspended') ? 'suspended' : 'activated';
        
        echo json_encode([
            'success' => true,
            'message' => "User '{$user['full_name']}' has been $action_word successfully",
            'user' => $updated_user,
            'previous_status' => $current_status,
            'new_status' => $new_status
        ]);
    } else {
        throw new Exception('Failed to update user status');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>