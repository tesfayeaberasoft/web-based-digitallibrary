<?php
/**
 * Get Librarian Notifications
 * GET /api/librarian/notifications
 * 
 * Returns system-wide notifications for librarians including:
 * - New book loans
 * - Book returns
 * - Overdue books
 * - Low inventory alerts
 * - New user registrations
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can access
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $notifications = [];
    
    // 1. Get overdue books (critical)
    $stmt = $db->prepare("
        SELECT 
            bl.id,
            bl.due_date,
            DATEDIFF(CURDATE(), bl.due_date) as days_overdue,
            u.full_name as user_name,
            u.email as user_email,
            b.title as book_title,
            b.author as book_author
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE bl.status = 'active' AND bl.due_date < CURDATE()
        ORDER BY bl.due_date ASC
        LIMIT 20
    ");
    $stmt->execute();
    $overdue_books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($overdue_books as $overdue) {
        $notifications[] = [
            'id' => 'overdue_' . $overdue['id'],
            'type' => 'overdue_alert',
            'title' => 'Overdue Book Alert',
            'message' => "{$overdue['user_name']} has '{$overdue['book_title']}' overdue by {$overdue['days_overdue']} days",
            'status' => 'unread',
            'priority' => 'high',
            'sent_at' => date('Y-m-d H:i:s'),
            'user_name' => $overdue['user_name'],
            'user_email' => $overdue['user_email'],
            'related_id' => $overdue['id'],
            'related_type' => 'loan'
        ];
    }
    
    // 2. Get low inventory books (warning threshold: 2 or fewer copies)
    $stmt = $db->prepare("
        SELECT 
            id,
            title,
            author,
            available_copies,
            total_copies
        FROM books
        WHERE status = 'active' AND available_copies <= 2 AND available_copies >= 0
        ORDER BY available_copies ASC
        LIMIT 15
    ");
    $stmt->execute();
    $low_inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($low_inventory as $book) {
        $priority = $book['available_copies'] == 0 ? 'high' : 'medium';
        $message = $book['available_copies'] == 0 
            ? "'{$book['title']}' is out of stock (0/{$book['total_copies']} available)"
            : "'{$book['title']}' has only {$book['available_copies']}/{$book['total_copies']} copies available";
            
        $notifications[] = [
            'id' => 'inventory_' . $book['id'],
            'type' => 'low_inventory',
            'title' => $book['available_copies'] == 0 ? 'Out of Stock' : 'Low Inventory Alert',
            'message' => $message,
            'status' => 'unread',
            'priority' => $priority,
            'sent_at' => date('Y-m-d H:i:s'),
            'related_id' => $book['id'],
            'related_type' => 'book'
        ];
    }
    
    // 3. Get today's loans
    $stmt = $db->prepare("
        SELECT 
            bl.id,
            bl.loan_date,
            u.full_name as user_name,
            u.email as user_email,
            b.title as book_title,
            b.author as book_author
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE DATE(bl.loan_date) = CURDATE()
        ORDER BY bl.loan_date DESC
        LIMIT 10
    ");
    $stmt->execute();
    $today_loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($today_loans as $loan) {
        $notifications[] = [
            'id' => 'loan_' . $loan['id'],
            'type' => 'new_loan',
            'title' => 'New Book Issued',
            'message' => "{$loan['user_name']} borrowed '{$loan['book_title']}'",
            'status' => 'unread',
            'priority' => 'low',
            'sent_at' => $loan['loan_date'],
            'user_name' => $loan['user_name'],
            'user_email' => $loan['user_email'],
            'related_id' => $loan['id'],
            'related_type' => 'loan'
        ];
    }
    
    // 4. Get today's returns
    $stmt = $db->prepare("
        SELECT 
            bl.id,
            bl.return_date,
            u.full_name as user_name,
            u.email as user_email,
            b.title as book_title,
            b.author as book_author
        FROM book_loans bl
        JOIN users u ON bl.user_id = u.id
        JOIN books b ON bl.book_id = b.id
        WHERE DATE(bl.return_date) = CURDATE()
        ORDER BY bl.return_date DESC
        LIMIT 10
    ");
    $stmt->execute();
    $today_returns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($today_returns as $return) {
        $notifications[] = [
            'id' => 'return_' . $return['id'],
            'type' => 'book_returned',
            'title' => 'Book Returned',
            'message' => "{$return['user_name']} returned '{$return['book_title']}'",
            'status' => 'unread',
            'priority' => 'low',
            'sent_at' => $return['return_date'],
            'user_name' => $return['user_name'],
            'user_email' => $return['user_email'],
            'related_id' => $return['id'],
            'related_type' => 'loan'
        ];
    }
    
    // 5. Get pending reservations
    $stmt = $db->prepare("
        SELECT 
            br.id,
            br.reservation_date,
            u.full_name as user_name,
            u.email as user_email,
            b.title as book_title,
            b.author as book_author,
            b.available_copies
        FROM book_reservations br
        JOIN users u ON br.user_id = u.id
        JOIN books b ON br.book_id = b.id
        WHERE br.status = 'pending'
        ORDER BY br.reservation_date ASC
        LIMIT 10
    ");
    $stmt->execute();
    $pending_reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($pending_reservations as $reservation) {
        $priority = $reservation['available_copies'] > 0 ? 'medium' : 'low';
        $message = $reservation['available_copies'] > 0
            ? "{$reservation['user_name']} reserved '{$reservation['book_title']}' - Book is now available!"
            : "{$reservation['user_name']} reserved '{$reservation['book_title']}' - Waiting for availability";
            
        $notifications[] = [
            'id' => 'reservation_' . $reservation['id'],
            'type' => 'pending_reservation',
            'title' => 'Pending Reservation',
            'message' => $message,
            'status' => 'unread',
            'priority' => $priority,
            'sent_at' => $reservation['reservation_date'],
            'user_name' => $reservation['user_name'],
            'user_email' => $reservation['user_email'],
            'related_id' => $reservation['id'],
            'related_type' => 'reservation'
        ];
    }
    
    // 6. Get unpaid fines
    $stmt = $db->prepare("
        SELECT 
            f.id,
            f.amount,
            f.fine_type,
            f.created_at,
            u.full_name as user_name,
            u.email as user_email
        FROM fines f
        JOIN users u ON f.user_id = u.id
        WHERE f.status = 'pending'
        ORDER BY f.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $unpaid_fines = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($unpaid_fines as $fine) {
        $notifications[] = [
            'id' => 'fine_' . $fine['id'],
            'type' => 'unpaid_fine',
            'title' => 'Unpaid Fine',
            'message' => "{$fine['user_name']} has an unpaid {$fine['fine_type']} fine of $" . number_format($fine['amount'], 2),
            'status' => 'unread',
            'priority' => 'medium',
            'sent_at' => $fine['created_at'],
            'user_name' => $fine['user_name'],
            'user_email' => $fine['user_email'],
            'related_id' => $fine['id'],
            'related_type' => 'fine'
        ];
    }
    
    // 7. Get new user registrations (last 7 days)
    $stmt = $db->prepare("
        SELECT 
            id,
            full_name,
            email,
            created_at
        FROM users
        WHERE role = 'user' AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $new_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($new_users as $user) {
        $notifications[] = [
            'id' => 'newuser_' . $user['id'],
            'type' => 'new_user',
            'title' => 'New User Registration',
            'message' => "{$user['full_name']} ({$user['email']}) registered",
            'status' => 'unread',
            'priority' => 'low',
            'sent_at' => $user['created_at'],
            'user_name' => $user['full_name'],
            'user_email' => $user['email'],
            'related_id' => $user['id'],
            'related_type' => 'user'
        ];
    }
    
    // 8. Get personal notifications for this librarian (from notifications table)
    $stmt = $db->prepare("
        SELECT 
            id,
            type,
            title,
            message,
            status,
            sent_at
        FROM notifications
        WHERE user_id = ? AND status = 'unread'
        ORDER BY sent_at DESC
        LIMIT 20
    ");
    $stmt->execute([$decoded['user_id']]);
    $personal_notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($personal_notifications as $notif) {
        // Determine priority based on type
        $priority = 'low';
        if (in_array($notif['type'], ['overdue_alert', 'fine_notice'])) {
            $priority = 'high';
        } elseif (in_array($notif['type'], ['reservation_available', 'due_reminder'])) {
            $priority = 'medium';
        }
        
        $notifications[] = [
            'id' => 'personal_' . $notif['id'],
            'type' => $notif['type'],
            'title' => $notif['title'],
            'message' => $notif['message'],
            'status' => $notif['status'],
            'priority' => $priority,
            'sent_at' => $notif['sent_at'],
            'related_id' => $notif['id'],
            'related_type' => 'notification'
        ];
    }
    
    // Sort notifications by priority and date
    usort($notifications, function($a, $b) {
        $priority_order = ['high' => 0, 'medium' => 1, 'low' => 2];
        $priority_diff = $priority_order[$a['priority']] - $priority_order[$b['priority']];
        if ($priority_diff !== 0) {
            return $priority_diff;
        }
        return strtotime($b['sent_at']) - strtotime($a['sent_at']);
    });
    
    // Count by priority
    $high_priority = count(array_filter($notifications, fn($n) => $n['priority'] === 'high'));
    $medium_priority = count(array_filter($notifications, fn($n) => $n['priority'] === 'medium'));
    $low_priority = count(array_filter($notifications, fn($n) => $n['priority'] === 'low'));
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'total_count' => count($notifications),
        'unread_count' => count($notifications),
        'priority_counts' => [
            'high' => $high_priority,
            'medium' => $medium_priority,
            'low' => $low_priority
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
