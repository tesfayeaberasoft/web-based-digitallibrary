<?php
/**
 * Run Notification Scheduler API
 * POST /api/notifications/run-scheduler
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    
    $decoded = requireAuth();
    
    // Only librarians and admins can run the scheduler
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    require_once __DIR__ . '/../../utils/notification-scheduler.php';
    
    // Run the scheduler
    $scheduler = new NotificationScheduler();
    $results = $scheduler->runScheduledNotifications();
    
    // Log the manual scheduler run
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, ip_address, new_values)
        VALUES (?, 'run_notification_scheduler', 'notifications', ?, ?)
    ");
    $audit_data = json_encode([
        'results' => $results,
        'triggered_by' => 'manual',
        'user_id' => $decoded['user_id']
    ]);
    $stmt->execute([$decoded['user_id'], $_SERVER['REMOTE_ADDR'], $audit_data]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Notification scheduler completed successfully',
        'results' => $results,
        'summary' => [
            'total_sent' => $results['due_reminders'] + $results['overdue_alerts'] + 
                           $results['reservation_notifications'] + $results['fine_reminders'],
            'errors' => $results['errors']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to run notification scheduler: ' . $e->getMessage()
    ]);
}
?>