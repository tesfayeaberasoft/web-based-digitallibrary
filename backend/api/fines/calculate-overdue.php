<?php
/**
 * Calculate Overdue Fines
 * Automatically calculates and updates fines based on library policies
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins and librarians can run fine calculations
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? 'calculate_all';
        
        switch ($action) {
            case 'calculate_all':
                handleCalculateAllOverdueFines($db);
                break;
            case 'calculate_user':
                handleCalculateUserFines($db, $data);
                break;
            case 'update_policies':
                handleUpdateFinePolicies($db);
                break;
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else if ($method === 'GET') {
        handleGetOverdueLoans($db);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleCalculateAllOverdueFines($db) {
    try {
        // Get library policy settings
        $finePerDay = getLibraryPolicySetting($db, 'due_fines_per_day', 0.50);
        $gracePeriod = getLibraryPolicySetting($db, 'grace_period_days', 3);
        
        // Get all overdue loans that don't have fines calculated yet
        $stmt = $db->prepare("
            SELECT 
                bl.*,
                b.title as book_title,
                u.full_name as user_name,
                u.email as user_email
            FROM book_loans bl
            JOIN books b ON bl.book_id = b.id
            JOIN users u ON bl.user_id = u.id
            WHERE bl.status = 'active' 
            AND bl.due_date < CURDATE()
            AND NOT EXISTS (
                SELECT 1 FROM fines f 
                WHERE f.loan_id = bl.id 
                AND f.status = 'pending'
            )
        ");
        $stmt->execute();
        $overdueLoans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $processedFines = [];
        $totalFinesCreated = 0;
        $totalAmount = 0;
        
        foreach ($overdueLoans as $loan) {
            $dueDate = new DateTime($loan['due_date']);
            $currentDate = new DateTime();
            $overdueDays = $currentDate->diff($dueDate)->days;
            
            // Apply grace period
            $chargeableDays = max(0, $overdueDays - $gracePeriod);
            
            if ($chargeableDays > 0) {
                $fineAmount = $chargeableDays * $finePerDay;
                
                // Create fine record
                $stmt = $db->prepare("
                    INSERT INTO fines (user_id, loan_id, amount, reason, status, created_at)
                    VALUES (?, ?, ?, ?, 'pending', NOW())
                ");
                
                $reason = "Overdue fine: {$chargeableDays} days × $" . number_format($finePerDay, 2);
                $stmt->execute([
                    $loan['user_id'],
                    $loan['id'],
                    $fineAmount,
                    $reason
                ]);
                
                $fineId = $db->lastInsertId();
                
                // Update loan status to overdue
                $stmt = $db->prepare("UPDATE book_loans SET status = 'overdue' WHERE id = ?");
                $stmt->execute([$loan['id']]);
                
                // Create notification for user
                $notificationsEnabled = getLibraryPolicySetting($db, 'overdue_reminders', true);
                if ($notificationsEnabled) {
                    $stmt = $db->prepare("
                        INSERT INTO notifications (user_id, type, title, message, created_at)
                        VALUES (?, 'fine', 'Overdue Fine Applied', ?, NOW())
                    ");
                    
                    $message = "A fine of $" . number_format($fineAmount, 2) . " has been applied for the overdue book '{$loan['book_title']}'. Please return the book and pay the fine.";
                    $stmt->execute([$loan['user_id'], $message]);
                }
                
                $processedFines[] = [
                    'fine_id' => $fineId,
                    'loan_id' => $loan['id'],
                    'user_name' => $loan['user_name'],
                    'book_title' => $loan['book_title'],
                    'overdue_days' => $overdueDays,
                    'chargeable_days' => $chargeableDays,
                    'fine_amount' => $fineAmount
                ];
                
                $totalFinesCreated++;
                $totalAmount += $fineAmount;
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => "Processed {$totalFinesCreated} overdue fines",
            'total_fines_created' => $totalFinesCreated,
            'total_amount' => round($totalAmount, 2),
            'fine_per_day' => $finePerDay,
            'grace_period_days' => $gracePeriod,
            'processed_fines' => $processedFines
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to calculate overdue fines: ' . $e->getMessage());
    }
}

function handleCalculateUserFines($db, $data) {
    try {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        // Get library policy settings
        $finePerDay = getLibraryPolicySetting($db, 'due_fines_per_day', 0.50);
        $gracePeriod = getLibraryPolicySetting($db, 'grace_period_days', 3);
        
        // Get user's overdue loans
        $stmt = $db->prepare("
            SELECT 
                bl.*,
                b.title as book_title,
                u.full_name as user_name
            FROM book_loans bl
            JOIN books b ON bl.book_id = b.id
            JOIN users u ON bl.user_id = u.id
            WHERE bl.user_id = ? 
            AND bl.status = 'active' 
            AND bl.due_date < CURDATE()
        ");
        $stmt->execute([$userId]);
        $overdueLoans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $userFines = [];
        $totalAmount = 0;
        
        foreach ($overdueLoans as $loan) {
            $dueDate = new DateTime($loan['due_date']);
            $currentDate = new DateTime();
            $overdueDays = $currentDate->diff($dueDate)->days;
            $chargeableDays = max(0, $overdueDays - $gracePeriod);
            $fineAmount = $chargeableDays * $finePerDay;
            
            $userFines[] = [
                'loan_id' => $loan['id'],
                'book_title' => $loan['book_title'],
                'due_date' => $loan['due_date'],
                'overdue_days' => $overdueDays,
                'chargeable_days' => $chargeableDays,
                'fine_amount' => $fineAmount
            ];
            
            $totalAmount += $fineAmount;
        }
        
        echo json_encode([
            'success' => true,
            'user_id' => $userId,
            'user_name' => $overdueLoans[0]['user_name'] ?? 'Unknown',
            'total_fines' => round($totalAmount, 2),
            'fine_per_day' => $finePerDay,
            'grace_period_days' => $gracePeriod,
            'overdue_loans' => $userFines
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to calculate user fines: ' . $e->getMessage());
    }
}

function handleGetOverdueLoans($db) {
    try {
        // Get all currently overdue loans
        $stmt = $db->prepare("
            SELECT 
                bl.*,
                b.title as book_title,
                b.author as book_author,
                u.full_name as user_name,
                u.email as user_email,
                DATEDIFF(CURDATE(), bl.due_date) as overdue_days,
                f.amount as existing_fine,
                f.status as fine_status
            FROM book_loans bl
            JOIN books b ON bl.book_id = b.id
            JOIN users u ON bl.user_id = u.id
            LEFT JOIN fines f ON bl.id = f.loan_id
            WHERE bl.status IN ('active', 'overdue') 
            AND bl.due_date < CURDATE()
            ORDER BY bl.due_date ASC
        ");
        $stmt->execute();
        $overdueLoans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get library policy settings for context
        $finePerDay = getLibraryPolicySetting($db, 'due_fines_per_day', 0.50);
        $gracePeriod = getLibraryPolicySetting($db, 'grace_period_days', 3);
        
        // Calculate potential fines for loans without existing fines
        foreach ($overdueLoans as &$loan) {
            if (!$loan['existing_fine']) {
                $chargeableDays = max(0, $loan['overdue_days'] - $gracePeriod);
                $loan['potential_fine'] = $chargeableDays * $finePerDay;
            } else {
                $loan['potential_fine'] = 0;
            }
        }
        
        echo json_encode([
            'success' => true,
            'overdue_loans' => $overdueLoans,
            'policy_settings' => [
                'fine_per_day' => $finePerDay,
                'grace_period_days' => $gracePeriod
            ],
            'summary' => [
                'total_overdue_loans' => count($overdueLoans),
                'loans_with_fines' => count(array_filter($overdueLoans, fn($l) => $l['existing_fine'] > 0)),
                'loans_needing_fines' => count(array_filter($overdueLoans, fn($l) => !$l['existing_fine'] && $l['potential_fine'] > 0))
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to get overdue loans: ' . $e->getMessage());
    }
}

function handleUpdateFinePolicies($db) {
    try {
        // This function can be called when fine policies are updated
        // to recalculate existing pending fines
        
        $finePerDay = getLibraryPolicySetting($db, 'due_fines_per_day', 0.50);
        $gracePeriod = getLibraryPolicySetting($db, 'grace_period_days', 3);
        
        // Get all pending fines
        $stmt = $db->prepare("
            SELECT 
                f.*,
                bl.due_date,
                DATEDIFF(CURDATE(), bl.due_date) as overdue_days
            FROM fines f
            JOIN book_loans bl ON f.loan_id = bl.id
            WHERE f.status = 'pending'
        ");
        $stmt->execute();
        $pendingFines = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $updatedFines = 0;
        
        foreach ($pendingFines as $fine) {
            $chargeableDays = max(0, $fine['overdue_days'] - $gracePeriod);
            $newAmount = $chargeableDays * $finePerDay;
            
            if ($newAmount != $fine['amount']) {
                $stmt = $db->prepare("
                    UPDATE fines 
                    SET amount = ?, 
                        reason = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                
                $reason = "Overdue fine (updated): {$chargeableDays} days × $" . number_format($finePerDay, 2);
                $stmt->execute([$newAmount, $reason, $fine['id']]);
                $updatedFines++;
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => "Updated {$updatedFines} pending fines based on new policies",
            'updated_fines' => $updatedFines,
            'new_fine_per_day' => $finePerDay,
            'new_grace_period' => $gracePeriod
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to update fine policies: ' . $e->getMessage());
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