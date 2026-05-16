<?php
/**
 * User Policy Validation API
 * Validates user actions against library policies
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/settings-helper.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'validateUserRegistration':
                handleValidateUserRegistration($db, $data);
                break;
            case 'checkUserStatus':
                handleCheckUserStatus($db, $data);
                break;
            case 'validatePasswordPolicy':
                handleValidatePasswordPolicy($db, $data);
                break;
            case 'getUserLimits':
                handleGetUserLimits($db, $data);
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

function handleValidateUserRegistration($db, $data) {
    try {
        // Check if user registration is allowed
        $allowRegistration = getSystemSetting($db, 'system_config', 'allow_registration', true);
        
        if (!$allowRegistration) {
            echo json_encode([
                'success' => false,
                'allowed' => false,
                'message' => 'User registration is currently disabled'
            ]);
            return;
        }
        
        // Check email verification requirement
        $requireEmailVerification = getSystemSetting($db, 'system_config', 'require_email_verification', true);
        
        // Validate password policy
        $passwordPolicy = validatePasswordPolicy($db, $data['password'] ?? '');
        
        echo json_encode([
            'success' => true,
            'allowed' => true,
            'require_email_verification' => $requireEmailVerification,
            'password_policy' => $passwordPolicy,
            'message' => 'Registration validation completed'
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to validate user registration: ' . $e->getMessage());
    }
}

function handleCheckUserStatus($db, $data) {
    try {
        $userId = $data['user_id'] ?? $decoded['user_id'];
        
        // Get user information
        $stmt = $db->prepare("
            SELECT id, full_name, email, role, status, created_at, last_login
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Get user's current loans and limits
        $borrowLimits = getUserBorrowLimits($db, $userId);
        $reservationLimits = getUserReservationLimits($db, $userId);
        $currentFines = getUserCurrentFines($db, $userId);
        
        // Check if user can perform various actions
        $canBorrow = $user['status'] === 'active' && $borrowLimits['can_borrow'];
        $canReserve = $user['status'] === 'active' && $reservationLimits['can_reserve'];
        $hasOutstandingFines = $currentFines['total_fines'] > 0;
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'permissions' => [
                'can_borrow' => $canBorrow,
                'can_reserve' => $canReserve,
                'can_renew' => $canBorrow, // Same as borrow for now
                'has_outstanding_fines' => $hasOutstandingFines
            ],
            'limits' => [
                'borrow' => $borrowLimits,
                'reservations' => $reservationLimits,
                'fines' => $currentFines
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to check user status: ' . $e->getMessage());
    }
}

function handleValidatePasswordPolicy($db, $data) {
    try {
        $password = $data['password'] ?? '';
        $validation = validatePasswordPolicy($db, $password);
        
        echo json_encode([
            'success' => true,
            'validation' => $validation
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to validate password policy: ' . $e->getMessage());
    }
}

function handleGetUserLimits($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        // Get all user limits and current usage
        $borrowLimits = getUserBorrowLimits($db, $userId);
        $reservationLimits = getUserReservationLimits($db, $userId);
        $currentFines = getUserCurrentFines($db, $userId);
        
        // Get policy settings
        $policies = [
            'max_user_borrow_books' => getSystemSetting($db, 'library_policies', 'max_user_borrow_books', 5),
            'max_reservations_per_user' => getSystemSetting($db, 'library_policies', 'max_reservations_per_user', 3),
            'max_book_return_days' => getSystemSetting($db, 'library_policies', 'max_book_return_days', 14),
            'due_fines_per_day' => getSystemSetting($db, 'library_policies', 'due_fines_per_day', 0.50),
            'grace_period_days' => getSystemSetting($db, 'library_policies', 'grace_period_days', 3)
        ];
        
        echo json_encode([
            'success' => true,
            'user_id' => $userId,
            'current_usage' => [
                'active_loans' => $borrowLimits['current_loans'],
                'active_reservations' => $reservationLimits['current_reservations'],
                'total_fines' => $currentFines['total_fines']
            ],
            'limits' => [
                'max_books' => $policies['max_user_borrow_books'],
                'max_reservations' => $policies['max_reservations_per_user'],
                'max_loan_days' => $policies['max_book_return_days']
            ],
            'availability' => [
                'can_borrow_more' => $borrowLimits['remaining_books'],
                'can_reserve_more' => $reservationLimits['remaining_reservations']
            ],
            'policies' => $policies
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to get user limits: ' . $e->getMessage());
    }
}

// Helper functions
function validatePasswordPolicy($db, $password) {
    $minLength = getSystemSetting($db, 'system_config', 'password_min_length', 6);
    $requireSpecial = getSystemSetting($db, 'system_config', 'password_require_special', false);
    
    $validation = [
        'is_valid' => true,
        'errors' => [],
        'requirements' => [
            'min_length' => $minLength,
            'require_special' => $requireSpecial
        ]
    ];
    
    // Check minimum length
    if (strlen($password) < $minLength) {
        $validation['is_valid'] = false;
        $validation['errors'][] = "Password must be at least {$minLength} characters long";
    }
    
    // Check special characters if required
    if ($requireSpecial && !preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
        $validation['is_valid'] = false;
        $validation['errors'][] = "Password must contain at least one special character";
    }
    
    // Check for common patterns
    if (preg_match('/^(password|123456|qwerty)/i', $password)) {
        $validation['is_valid'] = false;
        $validation['errors'][] = "Password is too common or weak";
    }
    
    return $validation;
}

function getUserBorrowLimits($db, $userId) {
    try {
        $maxBooks = getSystemSetting($db, 'library_policies', 'max_user_borrow_books', 5);
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as current_loans 
            FROM book_loans 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentLoans = $result['current_loans'];
        
        return [
            'current_loans' => $currentLoans,
            'max_books' => $maxBooks,
            'remaining_books' => max(0, $maxBooks - $currentLoans),
            'can_borrow' => $currentLoans < $maxBooks
        ];
    } catch (Exception $e) {
        return [
            'current_loans' => 0,
            'max_books' => 5,
            'remaining_books' => 5,
            'can_borrow' => true
        ];
    }
}

function getUserReservationLimits($db, $userId) {
    try {
        $maxReservations = getSystemSetting($db, 'library_policies', 'max_reservations_per_user', 3);
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as current_reservations 
            FROM reservations 
            WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentReservations = $result['current_reservations'];
        
        return [
            'current_reservations' => $currentReservations,
            'max_reservations' => $maxReservations,
            'remaining_reservations' => max(0, $maxReservations - $currentReservations),
            'can_reserve' => $currentReservations < $maxReservations
        ];
    } catch (Exception $e) {
        return [
            'current_reservations' => 0,
            'max_reservations' => 3,
            'remaining_reservations' => 3,
            'can_reserve' => true
        ];
    }
}

function getUserCurrentFines($db, $userId) {
    try {
        $stmt = $db->prepare("
            SELECT 
                COALESCE(SUM(amount), 0) as total_fines,
                COUNT(*) as fine_count
            FROM fines 
            WHERE user_id = ? AND status = 'pending'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'total_fines' => floatval($result['total_fines']),
            'fine_count' => intval($result['fine_count'])
        ];
    } catch (Exception $e) {
        return [
            'total_fines' => 0,
            'fine_count' => 0
        ];
    }
}

function getSystemSetting($db, $category, $settingKey, $defaultValue) {
    return getAppSetting($db, $category, $settingKey, $defaultValue);
}
?>