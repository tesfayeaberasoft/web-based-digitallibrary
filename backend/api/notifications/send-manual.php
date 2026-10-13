<?php
/**
 * Manual Notification Sending API
 * POST /api/notifications/send-manual
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    if (!in_array($decoded['role'], ['librarian', 'admin', 'super-admin'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'A valid JSON request body is required']);
        exit;
    }

    $allowedTypes = ['general', 'due_reminder', 'overdue_alert', 'fine_reminder'];
    $type = $data['type'] ?? '';
    $recipients = $data['recipients'] ?? null;
    $subject = trim((string)($data['subject'] ?? ''));
    $message = trim((string)($data['message'] ?? ''));

    if (!in_array($type, $allowedTypes, true) || $recipients === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Notification type and recipients are required']);
        exit;
    }

    if ($subject === '' || $message === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Subject and message are required']);
        exit;
    }

    if (mb_strlen($subject) > 255) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Subject must be 255 characters or fewer']);
        exit;
    }

    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/notification-log.php';
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    ensureNotificationLogsTable($db);

    $recipientConditions = ["u.status = 'active'", "u.role = 'user'"];
    $recipientParams = [];
    if ($recipients === 'all') {
        // Send to all active library members.
    } elseif ($recipients === 'overdue') {
        $recipientConditions[] = "EXISTS (
            SELECT 1 FROM book_loans l
            WHERE l.user_id = u.id AND l.status IN ('active', 'overdue') AND l.due_date < CURDATE()
        )";
    } elseif ($recipients === 'fines') {
        $recipientConditions[] = "EXISTS (
            SELECT 1 FROM fines f
            WHERE f.user_id = u.id
              AND f.status IN ('pending', 'partial')
              AND f.amount > f.paid_amount
        )";
    } elseif (is_array($recipients) && count($recipients) > 0) {
        $ids = array_values(array_unique(array_filter($recipients, function ($id) {
            return filter_var($id, FILTER_VALIDATE_INT) !== false && (int)$id > 0;
        })));
        if (count($ids) !== count($recipients)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Recipients must be active user IDs']);
            exit;
        }
        $recipientConditions[] = 'u.id IN (' . implode(',', array_fill(0, count($ids), '?')) . ')';
        $recipientParams = $ids;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Choose all users, users with overdue books, users with fines, or valid user IDs']);
        exit;
    }

    $query = 'SELECT u.id, u.full_name FROM users u WHERE ' . implode(' AND ', $recipientConditions) . ' ORDER BY u.id';
    $stmt = $db->prepare($query);
    $stmt->execute($recipientParams);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$users) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No active users match this audience']);
        exit;
    }

    $notificationType = $type === 'fine_reminder' ? 'fine_notice' : $type;
    $sentUsers = [];
    $sentNotifications = 0;
    $db->beginTransaction();

    foreach ($users as $user) {
        $relatedItems = [];
        if ($type === 'due_reminder' || $type === 'overdue_alert') {
            $dateCondition = $type === 'overdue_alert'
                ? "l.status IN ('active', 'overdue') AND l.due_date < CURDATE()"
                : 'l.due_date >= CURDATE() AND l.due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)';
            $itemStmt = $db->prepare("
                SELECT l.id, l.due_date, b.title
                FROM book_loans l
                JOIN books b ON b.id = l.book_id
                WHERE l.user_id = ? AND l.status = 'active' AND $dateCondition
                ORDER BY l.due_date
            ");
            $itemStmt->execute([$user['id']]);
            $relatedItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        } elseif ($type === 'fine_reminder') {
            $itemStmt = $db->prepare("
                SELECT id, amount, paid_amount
                FROM fines
                WHERE user_id = ? AND status IN ('pending', 'partial') AND amount > paid_amount
                ORDER BY created_at
            ");
            $itemStmt->execute([$user['id']]);
            $relatedItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($type !== 'general' && !$relatedItems) {
            continue;
        }

        if ($type === 'general') {
            $relatedItems[] = null;
        }

        foreach ($relatedItems as $item) {
            $notificationMessage = $message;
            $relatedId = null;
            $relatedType = null;

            if ($type === 'due_reminder' || $type === 'overdue_alert') {
                $dueDate = date('M j, Y', strtotime($item['due_date']));
                $detail = $type === 'overdue_alert'
                    ? "Overdue book: {$item['title']} (due {$dueDate})."
                    : "Book due soon: {$item['title']} (due {$dueDate}).";
                $notificationMessage = $detail . "\n\n" . $message;
                $relatedId = $item['id'];
                $relatedType = 'loan';
            } elseif ($type === 'fine_reminder') {
                $balance = number_format((float)$item['amount'] - (float)$item['paid_amount'], 2);
                $notificationMessage = "Outstanding fine balance: {$balance}.\n\n" . $message;
                $relatedId = $item['id'];
                $relatedType = 'fine';
            }

            $insertNotification = $db->prepare("
                INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $insertNotification->execute([
                $user['id'],
                $notificationType,
                $subject,
                $notificationMessage,
                $relatedId,
                $relatedType
            ]);

            $logStmt = $db->prepare("
                INSERT INTO notification_logs
                    (user_id, type, recipient, subject, message, status, related_id, related_type, sent_at)
                VALUES (?, 'in_app', ?, ?, ?, 'sent', ?, ?, NOW())
            ");
            $logStmt->execute([
                $user['id'],
                (string)$user['id'],
                $subject,
                $notificationMessage,
                $relatedId,
                $relatedType
            ]);
            $sentNotifications++;
        }

        if ($type === 'general' || $relatedItems) {
            $sentUsers[$user['id']] = $user['full_name'];
        }
    }

    if ($sentNotifications === 0) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No matching loans or outstanding fines were found for this notification']);
        exit;
    }

    $auditData = json_encode([
        'type' => $type,
        'subject' => $subject,
        'recipients_count' => count($sentUsers),
        'notifications_count' => $sentNotifications
    ]);
    $auditStmt = $db->prepare("
        INSERT INTO audit_logs (user_id, action, table_name, ip_address, new_values)
        VALUES (?, 'send_manual_notifications', 'notifications', ?, ?)
    ");
    $auditStmt->execute([
        $decoded['user_id'],
        $_SERVER['REMOTE_ADDR'] ?? null,
        $auditData
    ]);
    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => "In-app notifications delivered to " . count($sentUsers) . " users",
        'channel' => 'in_app',
        'sent_count' => count($sentUsers),
        'sent_notifications' => $sentNotifications,
        'failed_count' => 0,
        'total_recipients' => count($users),
        'results' => array_map(function ($name) {
            return ['user_name' => $name, 'success' => true];
        }, $sentUsers)
    ]);
    
} catch (Exception $e) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('Manual notification failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to deliver in-app notification: ' . $e->getMessage()]);
}
?>