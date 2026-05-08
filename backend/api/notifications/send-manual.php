<?php
/**
 * Manual Notification Sending API
 * POST /api/notifications/send-manual
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../utils/notification-service.php';
    
    $decoded = requireAuth();
    
    // Only librarians and admins can send manual notifications
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['type']) || !isset($data['recipients'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Notification type and recipients are required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    $notificationService = new NotificationService($db);
    
    $type = $data['type']; // 'due_reminder', 'overdue_alert', 'general', 'fine_reminder'
    $recipients = $data['recipients']; // Array of user IDs or 'all'
    $custom_message = $data['message'] ?? '';
    $custom_subject = $data['subject'] ?? '';
    
    $results = [];
    $sent_count = 0;
    $failed_count = 0;
    
    // Get recipient users
    if ($recipients === 'all') {
        $stmt = $db->prepare("
            SELECT id, full_name, email, phone 
            FROM users 
            WHERE status = 'active' AND role = 'user'
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $placeholders = str_repeat('?,', count($recipients) - 1) . '?';
        $stmt = $db->prepare("
            SELECT id, full_name, email, phone 
            FROM users 
            WHERE id IN ($placeholders) AND status = 'active'
        ");
        $stmt->execute($recipients);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    foreach ($users as $user) {
        $user_results = [];
        
        if ($type === 'due_reminder' || $type === 'overdue_alert') {
            // Get user's active loans
            $stmt = $db->prepare("
                SELECT l.id as loan_id, l.due_date, b.title, b.author
                FROM book_loans l
                JOIN books b ON l.book_id = b.id
                WHERE l.user_id = ? AND l.status = 'active'
            ");
            $stmt->execute([$user['id']]);
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($loans as $loan) {
                $days_until_due = (strtotime($loan['due_date']) - strtotime(date('Y-m-d'))) / (60 * 60 * 24);
                
                if (($type === 'due_reminder' && $days_until_due > 0) || 
                    ($type === 'overdue_alert' && $days_until_due < 0)) {
                    
                    $result = $notificationService->sendDueDateReminder(
                        $user['id'],
                        $loan['loan_id'],
                        (int)$days_until_due
                    );
                    
                    $user_results[] = $result;
                }
            }
        } else {
            // Send general or custom notification
            $subject = $custom_subject ?: 'Library Notification';
            $message = $custom_message ?: 'This is a notification from the library system.';
            
            // Send email
            if (!empty($user['email'])) {
                $email_result = $notificationService->sendEmail(
                    $user['email'],
                    $user['full_name'],
                    $subject,
                    $message
                );
                $user_results['email'] = $email_result;
            }
            
            // Send SMS
            if (!empty($user['phone'])) {
                $sms_result = $notificationService->sendSMS($user['phone'], $message);
                $user_results['sms'] = $sms_result;
            }
            
            // Create in-app notification
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, type, title, message)
                VALUES (?, 'general', ?, ?)
            ");
            $stmt->execute([$user['id'], $subject, $message]);
        }
        
        // Count results
        $user_success = false;
        foreach ($user_results as $result) {
            if (is_array($result) && isset($result['success']) && $result['success']) {
                $user_success = true;
                break;
            }
        }
        
        if ($user_success) {
            $sent_count++;
        } else {
            $failed_count++;
        }
        
        $results[$user['id']] = [
            'user_name' => $user['full_name'],
            'results' => $user_results
        ];
    }
    
    // Log the manual notification activity
    $stmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, ip_address, new_values)
        VALUES (?, 'send_manual_notifications', 'notifications', ?, ?)
    ");
    $audit_data = json_encode([
        'type' => $type,
        'recipients_count' => count($users),
        'sent_count' => $sent_count,
        'failed_count' => $failed_count,
        'custom_subject' => $custom_subject,
        'custom_message' => $custom_message
    ]);
    $stmt->execute([$decoded['user_id'], $_SERVER['REMOTE_ADDR'], $audit_data]);
    
    echo json_encode([
        'success' => true,
        'message' => "Notifications processed: $sent_count sent, $failed_count failed",
        'sent_count' => $sent_count,
        'failed_count' => $failed_count,
        'total_recipients' => count($users),
        'results' => $results
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>