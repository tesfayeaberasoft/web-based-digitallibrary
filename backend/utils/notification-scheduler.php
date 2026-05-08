<?php
/**
 * Automated Notification Scheduler
 * Runs periodically to send due date reminders and other automated notifications
 * Can be executed via cron job or manually
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/notification-service.php';

class NotificationScheduler {
    private $db;
    private $notificationService;
    private $stats;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->notificationService = new NotificationService($this->db);
        $this->stats = [
            'due_reminders' => 0,
            'overdue_alerts' => 0,
            'reservation_notifications' => 0,
            'fine_reminders' => 0,
            'transaction_alerts' => 0,
            'errors' => 0
        ];
    }
    
    /**
     * Run all scheduled notifications
     */
    public function runScheduledNotifications() {
        $this->log("🚀 Starting automated notification scheduler...");
        $start_time = microtime(true);
        
        try {
            // Run all notification types
            $this->sendDueDateReminders();
            $this->sendOverdueAlerts();
            $this->sendReservationNotifications();
            $this->sendFineReminders();
            $this->processTransactionAlerts();
            
            // Cleanup old logs
            $this->cleanupOldLogs();
            
            $execution_time = round(microtime(true) - $start_time, 2);
            $this->log("✅ Notification scheduler completed in {$execution_time}s");
            
            // Log summary to database
            $this->logSchedulerRun($execution_time);
            
            return $this->stats;
            
        } catch (Exception $e) {
            $this->log("❌ Scheduler failed: " . $e->getMessage());
            $this->stats['errors']++;
            throw $e;
        }
    }
    
    /**
     * Send due date reminders (3 days, 1 day before due)
     */
    public function sendDueDateReminders() {
        $this->log("📚 Processing due date reminders...");
        
        $reminder_days = [3, 1]; // Days before due date to send reminders
        
        foreach ($reminder_days as $days) {
            $target_date = date('Y-m-d', strtotime("+$days days"));
            
            // Get loans due in X days that haven't received reminders today
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    l.id as loan_id,
                    l.user_id,
                    l.due_date,
                    u.full_name,
                    u.email,
                    u.phone,
                    b.title as book_title,
                    b.author as book_author,
                    COALESCE(ns.email_enabled, TRUE) as email_enabled,
                    COALESCE(ns.sms_enabled, FALSE) as sms_enabled,
                    COALESCE(ns.due_reminder_days, '[3, 1]') as due_reminder_days
                FROM book_loans l
                JOIN users u ON l.user_id = u.id
                JOIN books b ON l.book_id = b.id
                LEFT JOIN notification_settings ns ON u.id = ns.user_id
                WHERE l.due_date = ?
                AND l.status = 'active'
                AND u.status = 'active'
                AND (COALESCE(ns.email_enabled, TRUE) = TRUE OR COALESCE(ns.sms_enabled, FALSE) = TRUE)
                AND NOT EXISTS (
                    SELECT 1 FROM notification_logs nl
                    WHERE nl.related_id = l.id
                    AND nl.related_type = 'loan'
                    AND nl.type IN ('email', 'sms')
                    AND DATE(nl.sent_at) = CURDATE()
                    AND nl.message LIKE CONCAT('%due in ', ?, ' days%')
                )
            ");
            $stmt->execute([$target_date, $days]);
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($loans as $loan) {
                // Check if user wants reminders for this number of days
                $user_reminder_days = json_decode($loan['due_reminder_days'], true) ?: [3, 1];
                if (!in_array($days, $user_reminder_days)) {
                    continue;
                }
                
                $result = $this->notificationService->sendDueDateReminder(
                    $loan['user_id'],
                    $loan['loan_id'],
                    $days
                );
                
                if ($result['success']) {
                    $this->stats['due_reminders']++;
                    $this->log("✅ Sent {$days}-day reminder to {$loan['full_name']} for '{$loan['book_title']}'");
                } else {
                    $this->stats['errors']++;
                    $this->log("❌ Failed to send reminder to {$loan['full_name']}: {$result['message']}");
                }
                
                // Small delay to avoid overwhelming email servers
                usleep(100000); // 0.1 second
            }
        }
        
        $this->log("📚 Due date reminders: {$this->stats['due_reminders']} sent");
    }
    
    /**
     * Send overdue alerts (1, 3, 7 days after due date)
     */
    public function sendOverdueAlerts() {
        $this->log("⚠️ Processing overdue alerts...");
        
        $overdue_days = [1, 3, 7]; // Days after due date to send alerts
        
        foreach ($overdue_days as $days) {
            $target_date = date('Y-m-d', strtotime("-$days days"));
            
            // Get overdue loans that need alerts
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    l.id as loan_id,
                    l.user_id,
                    l.due_date,
                    u.full_name,
                    u.email,
                    u.phone,
                    b.title as book_title,
                    b.author as book_author,
                    COALESCE(ns.email_enabled, TRUE) as email_enabled,
                    COALESCE(ns.sms_enabled, FALSE) as sms_enabled,
                    COALESCE(ns.overdue_reminder_days, '[1, 3, 7]') as overdue_reminder_days
                FROM book_loans l
                JOIN users u ON l.user_id = u.id
                JOIN books b ON l.book_id = b.id
                LEFT JOIN notification_settings ns ON u.id = ns.user_id
                WHERE l.due_date = ?
                AND l.status = 'active'
                AND u.status = 'active'
                AND (COALESCE(ns.email_enabled, TRUE) = TRUE OR COALESCE(ns.sms_enabled, FALSE) = TRUE)
                AND NOT EXISTS (
                    SELECT 1 FROM notification_logs nl
                    WHERE nl.related_id = l.id
                    AND nl.related_type = 'loan'
                    AND nl.type IN ('email', 'sms')
                    AND DATE(nl.sent_at) = CURDATE()
                    AND nl.message LIKE CONCAT('%', ?, ' days overdue%')
                )
            ");
            $stmt->execute([$target_date, $days]);
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($loans as $loan) {
                // Check if user wants overdue alerts for this number of days
                $user_overdue_days = json_decode($loan['overdue_reminder_days'], true) ?: [1, 3, 7];
                if (!in_array($days, $user_overdue_days)) {
                    continue;
                }
                
                $result = $this->notificationService->sendDueDateReminder(
                    $loan['user_id'],
                    $loan['loan_id'],
                    -$days // Negative for overdue
                );
                
                if ($result['success']) {
                    $this->stats['overdue_alerts']++;
                    $this->log("⚠️ Sent {$days}-day overdue alert to {$loan['full_name']} for '{$loan['book_title']}'");
                } else {
                    $this->stats['errors']++;
                    $this->log("❌ Failed to send overdue alert to {$loan['full_name']}: {$result['message']}");
                }
                
                usleep(100000); // 0.1 second delay
            }
        }
        
        $this->log("⚠️ Overdue alerts: {$this->stats['overdue_alerts']} sent");
    }
    
    /**
     * Send reservation available notifications
     */
    public function sendReservationNotifications() {
        $this->log("📖 Processing reservation notifications...");
        
        // Get reservations that should be notified (book became available)
        $stmt = $this->db->prepare("
            SELECT DISTINCT
                r.id as reservation_id,
                r.user_id,
                u.full_name,
                u.email,
                u.phone,
                b.title as book_title,
                b.author as book_author,
                COALESCE(ns.email_enabled, TRUE) as email_enabled,
                COALESCE(ns.sms_enabled, FALSE) as sms_enabled,
                COALESCE(ns.reservation_notifications, TRUE) as reservation_notifications
            FROM book_reservations r
            JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.id
            LEFT JOIN notification_settings ns ON u.id = ns.user_id
            WHERE r.status = 'pending'
            AND r.notification_sent = FALSE
            AND u.status = 'active'
            AND b.available_copies > 0
            AND COALESCE(ns.reservation_notifications, TRUE) = TRUE
            AND r.queue_position = 1
        ");
        $stmt->execute();
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($reservations as $reservation) {
            $result = $this->notificationService->sendReservationAvailable(
                $reservation['user_id'],
                $reservation['reservation_id']
            );
            
            if ($result['success']) {
                $this->stats['reservation_notifications']++;
                $this->log("📖 Sent reservation notification to {$reservation['full_name']} for '{$reservation['book_title']}'");
            } else {
                $this->stats['errors']++;
                $this->log("❌ Failed to send reservation notification to {$reservation['full_name']}: {$result['message']}");
            }
            
            usleep(100000); // 0.1 second delay
        }
        
        $this->log("📖 Reservation notifications: {$this->stats['reservation_notifications']} sent");
    }
    
    /**
     * Send fine payment reminders
     */
    public function sendFineReminders() {
        $this->log("💰 Processing fine reminders...");
        
        // Get users with unpaid fines older than 7 days
        $stmt = $this->db->prepare("
            SELECT DISTINCT
                f.user_id,
                u.full_name,
                u.email,
                u.phone,
                SUM(f.amount - f.paid_amount) as total_fine,
                COUNT(f.id) as fine_count,
                MIN(f.created_at) as oldest_fine_date,
                COALESCE(ns.email_enabled, TRUE) as email_enabled,
                COALESCE(ns.sms_enabled, FALSE) as sms_enabled,
                COALESCE(ns.fine_notifications, TRUE) as fine_notifications
            FROM fines f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN notification_settings ns ON u.id = ns.user_id
            WHERE f.status = 'pending'
            AND f.amount > f.paid_amount
            AND f.created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND u.status = 'active'
            AND COALESCE(ns.fine_notifications, TRUE) = TRUE
            AND NOT EXISTS (
                SELECT 1 FROM notification_logs nl
                WHERE nl.user_id = f.user_id
                AND nl.type IN ('email', 'sms')
                AND DATE(nl.sent_at) = CURDATE()
                AND nl.message LIKE '%fine%payment%'
            )
            GROUP BY f.user_id, u.full_name, u.email, u.phone, ns.email_enabled, ns.sms_enabled, ns.fine_notifications
            HAVING total_fine > 0
        ");
        $stmt->execute();
        $users_with_fines = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users_with_fines as $user) {
            $subject = "💰 Outstanding Library Fines - Payment Required";
            $message = "Hi {$user['full_name']}, you have outstanding library fines totaling $" . number_format($user['total_fine'], 2) . ". Please visit the library or pay online to avoid account suspension.";
            
            $results = [];
            
            // Send email
            if ($user['email_enabled'] && !empty($user['email'])) {
                $html_message = $this->generateFineReminderEmail($user);
                $email_result = $this->notificationService->sendEmail(
                    $user['email'],
                    $user['full_name'],
                    $subject,
                    $message,
                    $html_message
                );
                $results['email'] = $email_result;
            }
            
            // Send SMS
            if ($user['sms_enabled'] && !empty($user['phone'])) {
                $sms_message = "Library Notice: You have $" . number_format($user['total_fine'], 2) . " in outstanding fines. Please pay to avoid account suspension.";
                $sms_result = $this->notificationService->sendSMS($user['phone'], $sms_message);
                $results['sms'] = $sms_result;
            }
            
            if (!empty($results)) {
                $success = false;
                foreach ($results as $result) {
                    if ($result['success']) {
                        $success = true;
                        break;
                    }
                }
                
                if ($success) {
                    $this->stats['fine_reminders']++;
                    $this->log("💰 Sent fine reminder to {$user['full_name']} (${$user['total_fine']})");
                } else {
                    $this->stats['errors']++;
                    $this->log("❌ Failed to send fine reminder to {$user['full_name']}");
                }
            }
            
            usleep(100000); // 0.1 second delay
        }
        
        $this->log("💰 Fine reminders: {$this->stats['fine_reminders']} sent");
    }
    
    /**
     * Process pending transaction alerts
     */
    public function processTransactionAlerts() {
        $this->log("🔔 Processing transaction alerts...");
        
        // This would process any pending transaction alerts
        // For now, we'll just log that this feature is ready for implementation
        
        $this->log("🔔 Transaction alerts: {$this->stats['transaction_alerts']} sent");
    }
    
    /**
     * Generate fine reminder email template
     */
    private function generateFineReminderEmail($user) {
        $total_fine = number_format($user['total_fine'], 2);
        $fine_count = $user['fine_count'];
        $oldest_date = date('M j, Y', strtotime($user['oldest_fine_date']));
        
        return "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                <div style='background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 40px 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 32px; font-weight: 600;'>💰 Digital Library</h1>
                    <p style='margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;'>Outstanding Fines Notice</p>
                </div>
                
                <div style='padding: 40px 30px;'>
                    <h2 style='color: #f44336; margin-top: 0; font-size: 24px;'>Hello {$user['full_name']},</h2>
                    <p style='font-size: 16px; margin-bottom: 30px;'>You have outstanding library fines that require your attention:</p>
                    
                    <div style='background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 5px solid #f44336; margin-bottom: 30px;'>
                        <h3 style='margin: 0 0 15px 0; color: #333; font-size: 20px;'>Fine Summary</h3>
                        <p style='margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #f44336;'>Total Amount: $$total_fine</p>
                        <p style='margin: 0 0 10px 0; color: #666;'>Number of Fines: $fine_count</p>
                        <p style='margin: 0; color: #666;'>Oldest Fine Date: $oldest_date</p>
                    </div>
                    
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 30px 0;'>
                        <p style='margin: 0; color: #856404; font-weight: 600;'>⚠️ <strong>Important:</strong> Please pay your fines promptly to avoid account suspension and maintain your borrowing privileges.</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://localhost:3000/user/fines' style='background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin-right: 10px;'>Pay Online</a>
                        <a href='http://localhost:3000/user/fines' style='background: #4a9b8e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;'>View Details</a>
                    </div>
                </div>
                
                <div style='background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;'>
                    <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>Digital Library System - Automated Notification</p>
                    <p style='margin: 0; color: #999; font-size: 12px;'>Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Clean up old notification logs (older than 90 days)
     */
    public function cleanupOldLogs() {
        $this->log("🧹 Cleaning up old notification logs...");
        
        $stmt = $this->db->prepare("
            DELETE FROM notification_logs 
            WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
        ");
        $stmt->execute();
        $deleted = $stmt->rowCount();
        
        $this->log("🧹 Cleaned up $deleted old notification logs");
        return $deleted;
    }
    
    /**
     * Log scheduler run to database
     */
    private function logSchedulerRun($execution_time) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO notification_logs (type, recipient, subject, message, status, sent_at)
                VALUES ('system', 'scheduler', 'Automated Notification Run', ?, 'sent', NOW())
            ");
            
            $summary = json_encode([
                'execution_time' => $execution_time,
                'stats' => $this->stats,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
            $stmt->execute([$summary]);
        } catch (Exception $e) {
            $this->log("Failed to log scheduler run: " . $e->getMessage());
        }
    }
    
    /**
     * Log message with timestamp
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        echo "[$timestamp] $message\n";
        
        // Also log to error log for persistent storage
        error_log("NotificationScheduler: $message");
    }
}

// If running directly from command line
if (php_sapi_name() === 'cli') {
    try {
        $scheduler = new NotificationScheduler();
        $results = $scheduler->runScheduledNotifications();
        
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "📊 NOTIFICATION SUMMARY\n";
        echo str_repeat("=", 50) . "\n";
        echo "Due reminders sent: " . $results['due_reminders'] . "\n";
        echo "Overdue alerts sent: " . $results['overdue_alerts'] . "\n";
        echo "Reservation notifications sent: " . $results['reservation_notifications'] . "\n";
        echo "Fine reminders sent: " . $results['fine_reminders'] . "\n";
        echo "Transaction alerts sent: " . $results['transaction_alerts'] . "\n";
        echo "Errors encountered: " . $results['errors'] . "\n";
        echo str_repeat("=", 50) . "\n";
        
        // Exit with appropriate code
        exit($results['errors'] > 0 ? 1 : 0);
        
    } catch (Exception $e) {
        echo "❌ Scheduler failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}
?>