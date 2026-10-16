<?php
/**
 * Librarian Student Search API
 * GET /api/librarian/student-search?q=name_or_id
 *
 * Searches for students and returns their current borrowing status and fine information.
 * For Librarians and Admins only.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

header('Content-Type: application/json');

try {
    // Verify auth - librarian or admin only
    $decoded = requireAuth();
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        throw new Exception('Access denied. Librarians and Admins only.');
    }

    $query = trim($_GET['q'] ?? '');
    if (strlen($query) < 2) {
        throw new Exception('Search query must be at least 2 characters');
    }

    $db = Database::getInstance()->getConnection();

    // Search by name or ID
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.full_name,
            u.email,
            u.phone,
            u.user_id AS student_id,
            u.status as user_status,
            u.role,
            u.created_at,
            
            -- Fine information
            COUNT(DISTINCT f.id) as total_fines,
            COALESCE(SUM(CASE WHEN f.payment_status IN ('unpaid', 'partial') THEN 1 ELSE 0 END), 0) as unpaid_fines_count,
            COALESCE(SUM(CASE WHEN f.payment_status IN ('unpaid', 'partial') THEN f.amount - COALESCE(f.paid_amount, 0) ELSE 0 END), 0) as total_unpaid_balance,
            COALESCE(SUM(CASE WHEN f.payment_status = 'paid' THEN 1 ELSE 0 END), 0) as paid_fines_count,
            
            -- Latest fine details
            MAX(f.id) as latest_fine_id,
            MAX(CASE WHEN f.payment_status IN ('unpaid', 'partial') THEN f.created_at ELSE NULL END) as latest_unpaid_fine_date,
            
            -- Active loan count
            COUNT(DISTINCT l.id) as active_loans,
            MAX(CASE WHEN l.status = 'active' AND l.due_date < CURDATE() THEN 1 ELSE 0 END) as has_overdue_books,
            
            -- Payment history
            COUNT(DISTINCT p.id) as total_payments,
            COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END), 0) as total_paid_amount
            
        FROM users u
        LEFT JOIN fines f ON f.user_id = u.id
        LEFT JOIN payments p ON p.user_id = u.id AND p.status = 'success'
        LEFT JOIN book_loans l ON l.user_id = u.id
        
        WHERE (
            LOWER(u.full_name) LIKE LOWER(CONCAT('%', ?, '%'))
            OR u.user_id LIKE CONCAT('%', ?, '%')
            OR u.email LIKE CONCAT('%', ?, '%')
        )
        AND u.role = 'user'
        
        GROUP BY u.id, u.full_name, u.email, u.phone, u.user_id, u.status, u.role, u.created_at
        ORDER BY u.full_name ASC
        LIMIT 20
    ");
    
    $stmt->execute([$query, $query, $query]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($results)) {
        echo json_encode([
            'success' => true,
            'message' => 'No students found',
            'results' => [],
        ]);
        exit();
    }

    // Format results with detailed fine information
    $formatted = array_map(function($user) use ($db) {
        // Get detailed fines for this user
        $finesStmt = $db->prepare("
            SELECT 
                f.id,
                f.amount,
                f.paid_amount,
                f.payment_status,
                f.description,
                f.fine_type,
                f.created_at,
                f.payment_id,
                f.payment_date,
                f.paid_at,
                
                l.id as loan_id,
                l.loan_date,
                l.due_date,
                l.return_date,
                l.status as loan_status,
                
                b.title as book_title,
                b.isbn,
                b.author,
                
                p.tx_ref,
                p.status as payment_status,
                p.verified_at,
                p.amount as payment_amount
                
            FROM fines f
            LEFT JOIN book_loans l ON l.id = f.loan_id
            LEFT JOIN books b ON b.id = l.book_id
            LEFT JOIN payments p ON p.id = f.payment_id
            
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        ");
        $finesStmt->execute([$user['id']]);
        $fines = $finesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Format fines
        $formattedFines = array_map(function($fine) {
            return [
                'id'               => intval($fine['id']),
                'amount'           => floatval($fine['amount']),
                'paid_amount'      => floatval($fine['paid_amount'] ?? 0),
                'balance'          => floatval($fine['amount'] - ($fine['paid_amount'] ?? 0)),
                'payment_status'   => $fine['payment_status'],
                'type'             => $fine['fine_type'],
                'description'      => $fine['description'],
                'created_at'       => $fine['created_at'],
                'paid_at'          => $fine['paid_at'],
                'book'             => $fine['book_title'] ? [
                    'title'  => $fine['book_title'],
                    'author' => $fine['book_author'],
                    'isbn'   => $fine['isbn'],
                ] : null,
                'loan'             => $fine['loan_id'] ? [
                    'id'          => intval($fine['loan_id']),
                    'loan_date'   => $fine['loan_date'],
                    'due_date'    => $fine['due_date'],
                    'return_date' => $fine['return_date'],
                    'status'      => $fine['loan_status'],
                ] : null,
                'payment'          => $fine['payment_id'] ? [
                    'id'          => intval($fine['payment_id']),
                    'tx_ref'      => $fine['tx_ref'],
                    'status'      => $fine['payment_status'],
                    'amount'      => floatval($fine['payment_amount']),
                    'verified_at' => $fine['verified_at'],
                ] : null,
            ];
        }, $fines);

        // Get current borrowing restriction status
        $canBorrow = $user['unpaid_fines_count'] == 0;

        return [
            'id'                      => intval($user['id']),
            'full_name'               => $user['full_name'],
            'email'                   => $user['email'],
            'phone'                   => $user['phone'],
            'student_id'              => $user['student_id'],
            'user_status'             => $user['user_status'],
            'role'                    => $user['role'],
            'can_borrow'              => $canBorrow,  // FALSE if has unpaid fines
            'account_active'          => $user['user_status'] === 'active',
            'created_at'              => $user['created_at'],
            
            // Fine summary
            'fines'                   => [
                'total'               => intval($user['total_fines']),
                'unpaid_count'        => intval($user['unpaid_fines_count']),
                'paid_count'          => intval($user['paid_fines_count']),
                'total_unpaid_balance' => floatval($user['total_unpaid_balance']),
                'latest_unpaid_date'  => $user['latest_unpaid_fine_date'],
                'details'             => $formattedFines,
            ],
            
            // Loan summary
            'loans'                   => [
                'active_count'        => intval($user['active_loans']),
                'has_overdue'         => boolval($user['has_overdue_books']),
            ],
            
            // Payment summary
            'payments'                => [
                'total_count'         => intval($user['total_payments']),
                'total_paid_amount'   => floatval($user['total_paid_amount']),
            ],
        ];
    }, $results);

    echo json_encode([
        'success' => true,
        'count'   => count($formatted),
        'results' => $formatted,
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
