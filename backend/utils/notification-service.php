<?php
/**
 * Notification Service for Email and SMS
 * Handles sending automated notifications to users via SendGrid and other providers
 */

// Include PHPMailer
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class NotificationService {
    private $db;
    private $config;
    private $mailer;
    
    public function __construct($database) {
        $this->db = $database;
        $this->config = [
            'email' => [
                'provider' => $_ENV['EMAIL_PROVIDER'] ?? 'sendgrid', // sendgrid, smtp, mailgun
                'sendgrid_api_key' => $_ENV['SENDGRID_API_KEY'] ?? '',
                'smtp_host' => $_ENV['SMTP_HOST'] ?? 'smtp.sendgrid.net',
                'smtp_port' => $_ENV['SMTP_PORT'] ?? 587,
                'smtp_username' => $_ENV['SMTP_USERNAME'] ?? 'apikey',
                'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? $_ENV['SENDGRID_API_KEY'] ?? '',
                'from_email' => $_ENV['FROM_EMAIL'] ?? 'noreply@digitallibrary.com',
                'from_name' => $_ENV['FROM_NAME'] ?? 'Digital Library System',
                'reply_to' => $_ENV['REPLY_TO_EMAIL'] ?? 'support@digitallibrary.com'
            ],
            'sms' => [
                'provider' => $_ENV['SMS_PROVIDER'] ?? 'twilio', // twilio, nexmo, etc.
                'api_key' => $_ENV['SMS_API_KEY'] ?? '',
                'api_secret' => $_ENV['SMS_API_SECRET'] ?? '',
                'from_number' => $_ENV['SMS_FROM_NUMBER'] ?? ''
            ]
        ];
        
        $this->initializeMailer();
    }
    
    /**
     * Initialize PHPMailer with SendGrid configuration
     */
    private function initializeMailer() {
        $this->mailer = new PHPMailer(true);
        
        try {
            // Server settings for SendGrid
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['email']['smtp_host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['email']['smtp_username'];
            $this->mailer->Password = $this->config['email']['smtp_password'];
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = $this->config['email']['smtp_port'];
            
            // Default sender
            $this->mailer->setFrom(
                $this->config['email']['from_email'], 
                $this->config['email']['from_name']
            );
            $this->mailer->addReplyTo(
                $this->config['email']['reply_to'], 
                $this->config['email']['from_name']
            );
            
            // Enable verbose debug output (disable in production)
            if ($_ENV['APP_DEBUG'] ?? false) {
                $this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
            }
            
        } catch (Exception $e) {
            error_log("PHPMailer initialization failed: " . $e->getMessage());
        }
    }
    
    /**
     * Send email notification via SendGrid
     */
    public function sendEmail($to_email, $to_name, $subject, $message, $html_message = null) {
        try {
            // Clear any previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            // Recipients
            $this->mailer->addAddress($to_email, $to_name);
            
            // Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $html_message ?: $this->generateDefaultHtmlTemplate($subject, $message);
            $this->mailer->AltBody = strip_tags($message);
            
            // Add SendGrid headers for better deliverability
            $this->mailer->addCustomHeader('X-Entity-ID', 'digital-library-system');
            $this->mailer->addCustomHeader('X-Mailer', 'Digital Library v1.0');
            
            // Send the email
            $result = $this->mailer->send();
            
            if ($result) {
                // Log successful email
                $this->logNotification('email', $to_email, $subject, $message, 'sent');
                
                return [
                    'success' => true, 
                    'message' => 'Email sent successfully via SendGrid',
                    'provider' => 'sendgrid'
                ];
            } else {
                throw new Exception('Failed to send email');
            }
            
        } catch (Exception $e) {
            $error_message = $e->getMessage();
            error_log("SendGrid email sending failed: " . $error_message);
            
            // Log failed email
            $this->logNotification('email', $to_email, $subject, $message, 'failed', $error_message);
            
            return [
                'success' => false, 
                'message' => 'Failed to send email: ' . $error_message,
                'provider' => 'sendgrid'
            ];
        }
    }
    
    /**
     * Send SMS notification (placeholder for future SMS integration)
     */
    public function sendSMS($to_phone, $message) {
        try {
            // For now, we'll log the SMS and store in database
            // In production, integrate with Twilio, Nexmo, or other SMS providers
            
            $sms_data = [
                'to_phone' => $to_phone,
                'message' => $message,
                'sent_at' => date('Y-m-d H:i:s'),
                'status' => 'sent' // In production: 'pending', 'sent', 'failed'
            ];
            
            // Log SMS for debugging
            error_log("SMS NOTIFICATION: To: $to_phone, Message: $message");
            
            // Store SMS log in database
            $this->logNotification('sms', $to_phone, null, $message, 'sent');
            
            return ['success' => true, 'message' => 'SMS logged successfully (integration pending)'];
            
        } catch (Exception $e) {
            error_log("SMS sending failed: " . $e->getMessage());
            $this->logNotification('sms', $to_phone, null, $message, 'failed', $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send SMS: ' . $e->getMessage()];
        }
    }
    
    /**
     * Log notification to database
     */
    private function logNotification($type, $recipient, $subject, $message, $status, $error_message = null) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO notification_logs (type, recipient, subject, message, status, error_message, sent_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$type, $recipient, $subject, $message, $status, $error_message]);
        } catch (Exception $e) {
            error_log("Failed to log notification: " . $e->getMessage());
        }
    }
    
    /**
     * Send due date reminder with enhanced templates
     */
    public function sendDueDateReminder($user_id, $loan_id, $days_until_due) {
        try {
            // Get loan and user details
            $stmt = $this->db->prepare("
                SELECT 
                    l.*,
                    u.full_name,
                    u.email,
                    u.phone,
                    b.title as book_title,
                    b.author as book_author,
                    b.isbn
                FROM book_loans l
                JOIN users u ON l.user_id = u.id
                JOIN books b ON l.book_id = b.id
                WHERE l.id = ? AND l.user_id = ?
            ");
            $stmt->execute([$loan_id, $user_id]);
            $loan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$loan) {
                return ['success' => false, 'message' => 'Loan not found'];
            }
            
            $due_date = date('M j, Y', strtotime($loan['due_date']));
            $book_info = "'{$loan['book_title']}' by {$loan['book_author']}";
            
            // Determine message type and urgency
            if ($days_until_due > 0) {
                $message_type = 'due_reminder';
                $urgency = $days_until_due <= 1 ? 'high' : 'medium';
                $subject = "📚 Book Due Reminder - $days_until_due days remaining";
                $message = "Hi {$loan['full_name']}, your book $book_info is due in $days_until_due days on $due_date. Please return it on time to avoid late fees.";
            } elseif ($days_until_due == 0) {
                $message_type = 'due_today';
                $urgency = 'high';
                $subject = "⚠️ Book Due Today - Action Required";
                $message = "Hi {$loan['full_name']}, your book $book_info is due TODAY ($due_date). Please return it to avoid late fees.";
            } else {
                $message_type = 'overdue_alert';
                $urgency = 'critical';
                $overdue_days = abs($days_until_due);
                $subject = "🚨 Overdue Book Alert - $overdue_days days overdue";
                $message = "Hi {$loan['full_name']}, your book $book_info is $overdue_days days overdue (was due $due_date). Please return it immediately. Late fees may apply.";
            }
            
            $results = [];
            
            // Send email if available
            if (!empty($loan['email'])) {
                $html_message = $this->generateDueDateEmailTemplate($loan, $message_type, $days_until_due, $urgency);
                $email_result = $this->sendEmail($loan['email'], $loan['full_name'], $subject, $message, $html_message);
                $results['email'] = $email_result;
            }
            
            // Send SMS if available and enabled
            if (!empty($loan['phone'])) {
                $sms_message = $this->generateSMSMessage($loan, $message_type, $days_until_due);
                $sms_result = $this->sendSMS($loan['phone'], $sms_message);
                $results['sms'] = $sms_result;
            }
            
            // Create in-app notification
            $stmt = $this->db->prepare("
                INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
                VALUES (?, ?, ?, ?, ?, 'loan')
            ");
            $stmt->execute([$user_id, $message_type, $subject, $message, $loan_id]);
            
            return ['success' => true, 'results' => $results, 'urgency' => $urgency];
            
        } catch (Exception $e) {
            error_log("Due date reminder failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send reminder: ' . $e->getMessage()];
        }
    }
    
    /**
     * Send reservation available notification
     */
    public function sendReservationAvailable($user_id, $reservation_id) {
        try {
            // Get reservation and user details
            $stmt = $this->db->prepare("
                SELECT 
                    r.*,
                    u.full_name,
                    u.email,
                    u.phone,
                    b.title as book_title,
                    b.author as book_author,
                    b.isbn
                FROM book_reservations r
                JOIN users u ON r.user_id = u.id
                JOIN books b ON r.book_id = b.id
                WHERE r.id = ? AND r.user_id = ?
            ");
            $stmt->execute([$reservation_id, $user_id]);
            $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$reservation) {
                return ['success' => false, 'message' => 'Reservation not found'];
            }
            
            $book_info = "'{$reservation['book_title']}' by {$reservation['book_author']}";
            $subject = "📖 Reserved Book Available for Pickup";
            $message = "Hi {$reservation['full_name']}, your reserved book $book_info is now available for pickup. Please visit the library within 3 days to collect it.";
            
            $results = [];
            
            // Send email
            if (!empty($reservation['email'])) {
                $html_message = $this->generateReservationEmailTemplate($reservation);
                $email_result = $this->sendEmail($reservation['email'], $reservation['full_name'], $subject, $message, $html_message);
                $results['email'] = $email_result;
            }
            
            // Send SMS
            if (!empty($reservation['phone'])) {
                $sms_message = "Your reserved book '{$reservation['book_title']}' is ready for pickup at the library. Please collect within 3 days.";
                $sms_result = $this->sendSMS($reservation['phone'], $sms_message);
                $results['sms'] = $sms_result;
            }
            
            // Update reservation status and notification flag
            $stmt = $this->db->prepare("
                UPDATE book_reservations 
                SET status = 'available', notification_sent = TRUE, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$reservation_id]);
            
            return ['success' => true, 'results' => $results];
            
        } catch (Exception $e) {
            error_log("Reservation notification failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send notification: ' . $e->getMessage()];
        }
    }
    
    /**
     * Send transaction alert (loan, return, fine payment)
     */
    public function sendTransactionAlert($user_id, $transaction_type, $transaction_data) {
        try {
            // Get user details
            $stmt = $this->db->prepare("
                SELECT full_name, email, phone FROM users WHERE id = ?
            ");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            $subject = '';
            $message = '';
            $html_template = '';
            
            switch ($transaction_type) {
                case 'book_issued':
                    $subject = "📚 Book Issued Successfully";
                    $message = "Hi {$user['full_name']}, you have successfully borrowed '{$transaction_data['book_title']}'. Due date: {$transaction_data['due_date']}.";
                    $html_template = $this->generateTransactionTemplate('issue', $user, $transaction_data);
                    break;
                    
                case 'book_returned':
                    $subject = "✅ Book Returned Successfully";
                    $message = "Hi {$user['full_name']}, you have successfully returned '{$transaction_data['book_title']}'. Thank you!";
                    $html_template = $this->generateTransactionTemplate('return', $user, $transaction_data);
                    break;
                    
                case 'fine_payment':
                    $subject = "💰 Fine Payment Received";
                    $message = "Hi {$user['full_name']}, we have received your fine payment of $" . number_format($transaction_data['amount'], 2) . ". Thank you!";
                    $html_template = $this->generateTransactionTemplate('payment', $user, $transaction_data);
                    break;
                    
                default:
                    return ['success' => false, 'message' => 'Unknown transaction type'];
            }
            
            $results = [];
            
            // Send email
            if (!empty($user['email'])) {
                $email_result = $this->sendEmail($user['email'], $user['full_name'], $subject, $message, $html_template);
                $results['email'] = $email_result;
            }
            
            // Send SMS for critical transactions
            if (!empty($user['phone']) && in_array($transaction_type, ['book_issued', 'fine_payment'])) {
                $sms_result = $this->sendSMS($user['phone'], $message);
                $results['sms'] = $sms_result;
            }
            
            return ['success' => true, 'results' => $results];
            
        } catch (Exception $e) {
            error_log("Transaction alert failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send transaction alert: ' . $e->getMessage()];
        }
    }
    
    /**
     * Generate enhanced HTML email template for due date reminders
     */
    private function generateDueDateEmailTemplate($loan, $message_type, $days_until_due, $urgency) {
        $due_date = date('M j, Y', strtotime($loan['due_date']));
        $book_info = "{$loan['book_title']} by {$loan['book_author']}";
        
        // Color scheme based on urgency
        $colors = [
            'low' => ['primary' => '#4a9b8e', 'secondary' => '#3d8276'],
            'medium' => ['primary' => '#ff9800', 'secondary' => '#f57c00'],
            'high' => ['primary' => '#f44336', 'secondary' => '#d32f2f'],
            'critical' => ['primary' => '#d32f2f', 'secondary' => '#b71c1c']
        ];
        
        $color = $colors[$urgency] ?? $colors['medium'];
        $icon = $days_until_due >= 0 ? '📚' : '⚠️';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Library Notification</title>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                <!-- Header -->
                <div style='background: linear-gradient(135deg, {$color['primary']} 0%, {$color['secondary']} 100%); color: white; padding: 40px 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 32px; font-weight: 600;'>$icon Digital Library</h1>
                    <p style='margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;'>Book Due Date Notification</p>
                </div>
                
                <!-- Content -->
                <div style='padding: 40px 30px;'>
                    <h2 style='color: {$color['primary']}; margin-top: 0; font-size: 24px;'>Hello {$loan['full_name']},</h2>
                    <p style='font-size: 16px; margin-bottom: 30px; color: #555;'>This is an important reminder about your borrowed book:</p>
                    
                    <!-- Book Details Card -->
                    <div style='background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 5px solid {$color['primary']}; margin-bottom: 30px;'>
                        <h3 style='margin: 0 0 15px 0; color: #333; font-size: 20px;'>$book_info</h3>
                        <div style='display: flex; justify-content: space-between; flex-wrap: wrap;'>
                            <p style='margin: 5px 0; color: #666;'><strong>ISBN:</strong> {$loan['isbn']}</p>
                            <p style='margin: 5px 0; color: #666;'><strong>Due Date:</strong> $due_date</p>
                        </div>
                        <p style='margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: {$color['primary']};'>
                            " . ($days_until_due >= 0 ? "Days Remaining: " . $days_until_due : "Days Overdue: " . abs($days_until_due)) . "
                        </p>
                    </div>
                    
                    <!-- Action Button -->
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://localhost:3000/user/books' style='background: {$color['primary']}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>View My Books</a>
                    </div>
                    
                    <!-- Important Notice -->
                    " . ($days_until_due < 0 ? "
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p style='margin: 0; color: #856404; font-weight: 600;'>⚠️ <strong>Overdue Notice:</strong> This book is overdue. Please return it immediately to avoid additional late fees.</p>
                    </div>
                    " : "") . "
                </div>
                
                <!-- Footer -->
                <div style='background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;'>
                    <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>
                        <strong>Need Help?</strong> Contact us at support@digitallibrary.com or visit our website.
                    </p>
                    <p style='margin: 0; color: #999; font-size: 12px;'>
                        This is an automated message from Digital Library System. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Generate reservation email template
     */
    private function generateReservationEmailTemplate($reservation) {
        $book_info = "{$reservation['book_title']} by {$reservation['book_author']}";
        $pickup_deadline = date('M j, Y', strtotime('+3 days'));
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Reserved Book Available</title>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                <div style='background: linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%); color: white; padding: 40px 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 32px; font-weight: 600;'>📖 Digital Library</h1>
                    <p style='margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;'>Reserved Book Available</p>
                </div>
                
                <div style='padding: 40px 30px;'>
                    <h2 style='color: #4a9b8e; margin-top: 0; font-size: 24px;'>Great News, {$reservation['full_name']}!</h2>
                    <p style='font-size: 16px; margin-bottom: 30px;'>Your reserved book is now available for pickup:</p>
                    
                    <div style='background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 5px solid #4a9b8e; margin-bottom: 30px;'>
                        <h3 style='margin: 0 0 15px 0; color: #333; font-size: 20px;'>$book_info</h3>
                        <p style='margin: 5px 0; color: #666;'><strong>ISBN:</strong> {$reservation['isbn']}</p>
                        <p style='margin: 5px 0; color: #666;'><strong>Status:</strong> Ready for Pickup</p>
                        <p style='margin: 5px 0; color: #666;'><strong>Pickup Deadline:</strong> $pickup_deadline</p>
                    </div>
                    
                    <div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 30px 0;'>
                        <p style='margin: 0; color: #856404;'><strong>Important:</strong> Please collect your book within 3 days or it will be made available to the next person in the queue.</p>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://localhost:3000/user/reservations' style='background: #4a9b8e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;'>View My Reservations</a>
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
     * Generate transaction alert template
     */
    private function generateTransactionTemplate($type, $user, $data) {
        $colors = [
            'issue' => ['primary' => '#4a9b8e', 'icon' => '📚'],
            'return' => ['primary' => '#4caf50', 'icon' => '✅'],
            'payment' => ['primary' => '#ff9800', 'icon' => '💰']
        ];
        
        $config = $colors[$type] ?? $colors['issue'];
        $title = ucfirst($type) . ' Confirmation';
        
        return "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: white;'>
                <div style='background: {$config['primary']}; color: white; padding: 30px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 28px;'>{$config['icon']} $title</h1>
                </div>
                <div style='padding: 30px;'>
                    <h2>Hello {$user['full_name']},</h2>
                    <p>Your transaction has been processed successfully.</p>
                    <!-- Transaction details would go here based on type -->
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Generate default HTML template
     */
    private function generateDefaultHtmlTemplate($subject, $message) {
        return "
        <!DOCTYPE html>
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #4a9b8e;'>$subject</h2>
                <p>" . nl2br(htmlspecialchars($message)) . "</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                <p style='font-size: 12px; color: #666;'>Digital Library System - Automated Notification</p>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Generate SMS message
     */
    private function generateSMSMessage($loan, $message_type, $days_until_due) {
        $due_date = date('M j', strtotime($loan['due_date']));
        $book_title = $loan['book_title'];
        
        if ($days_until_due > 0) {
            return "Library: '$book_title' due in $days_until_due days ($due_date). Please return on time.";
        } elseif ($days_until_due == 0) {
            return "Library: '$book_title' due TODAY ($due_date). Return to avoid fees.";
        } else {
            $overdue_days = abs($days_until_due);
            return "Library: '$book_title' is $overdue_days days overdue. Return immediately.";
        }
    }
}
?>