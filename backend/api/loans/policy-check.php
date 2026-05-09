<?php
/**
 * Loan Policy Check API
 * Enforces library policies from settings system
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'checkBorrowLimit':
                handleCheckBorrowLimit($db, $data);
                break;
            case 'calculateFines':
                handleCalculateFines($db, $data);
                break;
            case 'checkReservationLimit':
                handleCheckReservationLimit($db, $data);
                break;
            case 'validateLoanPeriod':
                handleValidateLoanPeriod($db, $data);
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleCheckBorrowLimit($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        // Get library policy settings
        $maxBooks = getLibraryPolicySetting($db, 'max_user_borrow_books', 5);
        
        // Count current active loans for user
        $stmt = $db->prepare("
            SELECT COUNT(*) as current_loans 
            FROM loans 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentLoans = $result['current_loans'];
        
        $canBorrow = $currentLoans < $maxBooks;
        $remainingBooks = max(0, $maxBooks - $currentLoans);
        
        echo json_encode([
            'success' => true,
            'can_borrow' => $canBorrow,
            'current_loans' => $currentLoans,
            'max_books' => $maxBooks,
            'remaining_books' => $remainingBooks,
            'message' => $canBorrow ? 
                "User can borrow {$remainingBooks} more books" : 
                "User has reached maximum borrowing limit ({$maxBooks} books)"
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to check borrow limit: ' . $e->getMessage());
    }
}

function handleCalculateFines($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        $loanId = $data['loan_id'] ?? null;
        
        if (!$userId && !$loanId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID or Loan ID is required']);
            return;
        }
        
        // Get fine policy settings
        $finePerDay = getLibraryPolicySetting($db, 'due_fines_per_day', 0.50);
        $gracePeriod = getLibraryPolicySetting($db, 'grace_period_days', 3);
        
        $totalFines = 0;
        $fineDetails = [];
        
        if ($loanId) {
            // Calculate fine for specific loan
            $stmt = $db->prepare("
                SELECT l.*, b.title 
                FROM loans l 
                JOIN books b ON l.book_id = b.id 
                WHERE l.id = ? AND l.status IN ('active', 'overdue')
            ");
            $stmt->execute([$loanId]);
            $loans = [$stmt->fetch(PDO::FETCH_ASSOC)];
        } else {
            // Calculate fines for all user's overdue loans
            $stmt = $db->prepare("
                SELECT l.*, b.title 
                FROM loans l 
                JOIN books b ON l.book_id = b.id 
                WHERE l.user_id = ? AND l.status IN ('active', 'overdue')
            ");
            $stmt->execute([$userId]);
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        foreach ($loans as $loan) {
            if (!$loan) continue;
            
            $dueDate = new DateTime($loan['due_date']);
            $currentDate = new DateTime();
            
            if ($currentDate > $dueDate) {
                $overdueDays = $currentDate->diff($dueDate)->days;
                $chargeableDays = max(0, $overdueDays - $gracePeriod);
                $loanFine = $chargeableDays * $finePerDay;
                
                $totalFines += $loanFine;
                $fineDetails[] = [
                    'loan_id' => $loan['id'],
                    'book_title' => $loan['title'],
                    'due_date' => $loan['due_date'],
                    'overdue_days' => $overdueDays,
                    'chargeable_days' => $chargeableDays,
                    'fine_amount' => $loanFine
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'total_fines' => round($totalFines, 2),
            'fine_per_day' => $finePerDay,
            'grace_period_days' => $gracePeriod,
            'fine_details' => $fineDetails
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to calculate fines: ' . $e->getMessage());
    }
}

function handleCheckReservationLimit($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        // Get reservation policy settings
        $maxReservations = getLibraryPolicySetting($db, 'max_reservations_per_user', 3);
        
        // Count current active reservations for user
        $stmt = $db->prepare("
            SELECT COUNT(*) as current_reservations 
            FROM reservations 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentReservations = $result['current_reservations'];
        
        $canReserve = $currentReservations < $maxReservations;
        $remainingReservations = max(0, $maxReservations - $currentReservations);
        
        echo json_encode([
            'success' => true,
            'can_reserve' => $canReserve,
            'current_reservations' => $currentReservations,
            'max_reservations' => $maxReservations,
            'remaining_reservations' => $remainingReservations,
            'message' => $canReserve ? 
                "User can make {$remainingReservations} more reservations" : 
                "User has reached maximum reservation limit ({$maxReservations} reservations)"
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to check reservation limit: ' . $e->getMessage());
    }
}

function handleValidateLoanPeriod($db, $data) {
    try {
        $requestedDays = $data['loan_days'] ?? null;
        
        if (!$requestedDays) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Loan days is required']);
            return;
        }
        
        // Get loan period policy settings
        $maxReturnDays = getLibraryPolicySetting($db, 'max_book_return_days', 14);
        
        $isValid = $requestedDays <= $maxReturnDays;
        
        echo json_encode([
            'success' => true,
            'is_valid' => $isValid,
            'requested_days' => $requestedDays,
            'max_return_days' => $maxReturnDays,
            'message' => $isValid ? 
                "Loan period is valid" : 
                "Loan period exceeds maximum allowed days ({$maxReturnDays} days)"
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to validate loan period: ' . $e->getMessage());
    }
}

function getLibraryPolicySetting($db, $settingKey, $defaultValue) {
    try {
        $stmt = $db->prepare("
            SELECT setting_value 
            FROM system_settings 
            WHERE category = 'library_policies' AND setting_key = ?
        ");
        $stmt->execute([$settingKey]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $value = $result['setting_value'];
            // Try to convert to appropriate type
            if (is_numeric($value)) {
                return strpos($value, '.') !== false ? floatval($value) : intval($value);
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