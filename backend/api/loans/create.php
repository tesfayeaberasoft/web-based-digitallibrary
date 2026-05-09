<?php
/**
 * Issue Book (Create Loan)
 * POST /api/loans
 * Enhanced with library policy integration
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../config/config.php';
    
    $decoded = requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['book_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing book_id']);
        exit;
    }
    
    // Use user_id from JWT token (more secure)
    $user_id = $decoded['user_id'];
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Check library policy - borrow limit
    $borrowCheck = checkBorrowLimit($db, $user_id);
    if (!$borrowCheck['can_borrow']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $borrowCheck['message'],
            'current_loans' => $borrowCheck['current_loans'],
            'max_books' => $borrowCheck['max_books']
        ]);
        exit;
    }
    
    // Check if book is available
    $stmt = $db->prepare("SELECT * FROM books WHERE id = ? AND status = 'active'");
    $stmt->execute([$data['book_id']]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found or unavailable']);
        exit;
    }
    
    if ($book['available_copies'] <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No copies available']);
        exit;
    }
    
    // Check if user already has this book
    $stmt = $db->prepare("SELECT id FROM book_loans WHERE user_id = ? AND book_id = ? AND status = 'active'");
    $stmt->execute([$user_id, $data['book_id']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User already has this book']);
        exit;
    }
    
    // Get loan period from library policy settings
    $maxReturnDays = getLibraryPolicySetting($db, 'max_book_return_days', 14);
    $borrow_days = $data['borrow_days'] ?? $maxReturnDays;
    
    // Validate loan period against policy
    if ($borrow_days > $maxReturnDays) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Loan period exceeds maximum allowed days ({$maxReturnDays} days)",
            'max_return_days' => $maxReturnDays
        ]);
        exit;
    }
    
    $due_date = date('Y-m-d', strtotime("+$borrow_days days"));
    
    // Create loan
    $stmt = $db->prepare("
        INSERT INTO book_loans (user_id, book_id, issued_by, loan_date, due_date, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'active')
    ");
    
    $stmt->execute([
        $user_id,
        $data['book_id'],
        $decoded['user_id'],
        $due_date
    ]);
    
    $loan_id = $db->lastInsertId();
    
    // Update book availability
    $stmt = $db->prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
    $stmt->execute([$data['book_id']]);
    
    // Create notification for user (if notifications are enabled)
    $notificationsEnabled = getLibraryPolicySetting($db, 'email_enabled', true);
    if ($notificationsEnabled) {
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'loan', 'Book Issued', ?)
        ");
        $message = "You have successfully borrowed '{$book['title']}'. Due date: $due_date";
        $stmt->execute([$user_id, $message]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Book issued successfully',
        'loan_id' => $loan_id,
        'due_date' => $due_date,
        'borrow_days' => $borrow_days,
        'remaining_books' => $borrowCheck['remaining_books'] - 1
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function checkBorrowLimit($db, $userId) {
    try {
        // Get library policy settings
        $maxBooks = getLibraryPolicySetting($db, 'max_user_borrow_books', 5);
        
        // Count current active loans for user
        $stmt = $db->prepare("
            SELECT COUNT(*) as current_loans 
            FROM book_loans 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentLoans = $result['current_loans'];
        
        $canBorrow = $currentLoans < $maxBooks;
        $remainingBooks = max(0, $maxBooks - $currentLoans);
        
        return [
            'can_borrow' => $canBorrow,
            'current_loans' => $currentLoans,
            'max_books' => $maxBooks,
            'remaining_books' => $remainingBooks,
            'message' => $canBorrow ? 
                "User can borrow {$remainingBooks} more books" : 
                "User has reached maximum borrowing limit ({$maxBooks} books)"
        ];
        
    } catch (Exception $e) {
        error_log("Failed to check borrow limit: " . $e->getMessage());
        return [
            'can_borrow' => false,
            'current_loans' => 0,
            'max_books' => 5,
            'remaining_books' => 0,
            'message' => 'Unable to verify borrowing limit'
        ];
    }
}

function getLibraryPolicySetting($db, $settingKey, $defaultValue) {
    try {
        $stmt = $db->prepare("
            SELECT setting_value 
            FROM system_settings 
            WHERE category IN ('library_policies', 'notifications') AND setting_key = ?
        ");
        $stmt->execute([$settingKey]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $value = $result['setting_value'];
            // Try to convert to appropriate type
            if (is_numeric($value)) {
                return strpos($value, '.') !== false ? floatval($value) : intval($value);
            }
            if (in_array(strtolower($value), ['true', 'false'])) {
                return strtolower($value) === 'true';
            }
            return $value;
        }
        
        return $defaultValue;
    } catch (Exception $e) {
        error_log("Failed to get library policy setting {$settingKey}: " . $e->getMessage());
        return $defaultValue;
    }
}
?>
