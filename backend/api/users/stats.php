<?php
/**
 * Get User Statistics
 * GET /api/users/{id}/stats
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    $user_id = isset($_GET['id']) ? intval($_GET['id']) : $decoded['user_id'];
    
    // Users can only see their own stats
    if ($decoded['role'] === 'user' && $decoded['user_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get books read (returned loans)
    $stmt = $db->prepare("
        SELECT COUNT(*) as books_read
        FROM book_loans
        WHERE user_id = ? AND status = 'returned'
    ");
    $stmt->execute([$user_id]);
    $books_read = $stmt->fetch(PDO::FETCH_ASSOC)['books_read'];
    
    // Get currently reading (active loans)
    $stmt = $db->prepare("
        SELECT COUNT(*) as currently_reading
        FROM book_loans
        WHERE user_id = ? AND status = 'active'
    ");
    $stmt->execute([$user_id]);
    $currently_reading = $stmt->fetch(PDO::FETCH_ASSOC)['currently_reading'];
    
    // Calculate reading streak (consecutive days with active or returned loans)
    $stmt = $db->prepare("
        SELECT DISTINCT DATE(loan_date) as loan_day
        FROM book_loans
        WHERE user_id = ?
        ORDER BY loan_day DESC
        LIMIT 30
    ");
    $stmt->execute([$user_id]);
    $loan_days = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $reading_streak = 0;
    $today = new DateTime();
    $yesterday = (clone $today)->modify('-1 day');
    
    if (!empty($loan_days)) {
        $last_loan = new DateTime($loan_days[0]);
        // Check if there's activity today or yesterday
        if ($last_loan->format('Y-m-d') === $today->format('Y-m-d') || 
            $last_loan->format('Y-m-d') === $yesterday->format('Y-m-d')) {
            $reading_streak = 1;
            $prev_date = $last_loan;
            
            for ($i = 1; $i < count($loan_days); $i++) {
                $current_date = new DateTime($loan_days[$i]);
                $diff = $prev_date->diff($current_date)->days;
                
                if ($diff <= 1) {
                    $reading_streak++;
                    $prev_date = $current_date;
                } else {
                    break;
                }
            }
        }
    }
    
    // Calculate total reading hours (estimate: 14 days per book, 2 hours per day)
    $total_hours = $books_read * 28; // Rough estimate
    
    // Get achievements count
    $stmt = $db->prepare("
        SELECT COUNT(*) as achievements
        FROM user_achievements
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $achievements = $stmt->fetch(PDO::FETCH_ASSOC)['achievements'];
    
    // Get total achievements available
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM achievements");
    $stmt->execute();
    $total_achievements = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'books_read' => (int)$books_read,
            'currently_reading' => (int)$currently_reading,
            'reading_streak' => (int)$reading_streak,
            'total_hours' => (int)$total_hours,
            'achievements' => (int)$achievements,
            'total_achievements' => (int)$total_achievements
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
