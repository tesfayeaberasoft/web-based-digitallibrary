<?php
/**
 * Notification Settings API
 * GET /api/notifications/settings - Get user's notification settings
 * PUT /api/notifications/settings - Update user's notification settings
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user's notification settings
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : $decoded['user_id'];
        
        // Only allow users to view their own settings, or librarians/admins to view any
        if ($user_id !== $decoded['user_id'] && !in_array($decoded['role'], ['librarian', 'admin'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
            exit;
        }
        
        $stmt = $db->prepare("
            SELECT * FROM notification_settings 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$settings) {
            // Create default settings
            $stmt = $db->prepare("
                INSERT INTO notification_settings (user_id) VALUES (?)
            ");
            $stmt->execute([$user_id]);
            
            // Fetch the newly created settings
            $stmt = $db->prepare("
                SELECT * FROM notification_settings 
                WHERE user_id = ?
            ");
            $stmt->execute([$user_id]);
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        // Parse JSON fields
        $settings['due_reminder_days'] = json_decode($settings['due_reminder_days'], true);
        $settings['overdue_reminder_days'] = json_decode($settings['overdue_reminder_days'], true);
        
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update user's notification settings
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? $decoded['user_id'];
        
        // Only allow users to update their own settings, or librarians/admins to update any
        if ($user_id !== $decoded['user_id'] && !in_array($decoded['role'], ['librarian', 'admin'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
            exit;
        }
        
        $stmt = $db->prepare("
            UPDATE notification_settings SET
                email_enabled = ?,
                sms_enabled = ?,
                push_enabled = ?,
                due_reminder_days = ?,
                overdue_reminder_days = ?,
                reservation_notifications = ?,
                fine_notifications = ?,
                general_notifications = ?,
                updated_at = NOW()
            WHERE user_id = ?
        ");
        
        $stmt->execute([
            $data['email_enabled'] ?? true,
            $data['sms_enabled'] ?? false,
            $data['push_enabled'] ?? true,
            json_encode($data['due_reminder_days'] ?? [3, 1]),
            json_encode($data['overdue_reminder_days'] ?? [1, 3, 7]),
            $data['reservation_notifications'] ?? true,
            $data['fine_notifications'] ?? true,
            $data['general_notifications'] ?? true,
            $user_id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Notification settings updated successfully'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>