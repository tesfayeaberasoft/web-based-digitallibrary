<?php
/**
 * Get Unpaid Fines for Current User
 * GET /api/fines/unpaid
 *
 * Returns all unpaid and partially paid fines with book/loan details.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $decoded = requireAuth();
    $userId  = $decoded['user_id'];

    $db = Database::getInstance()->getConnection();

    // Get all unpaid/partial fines with details
    $stmt = $db->prepare("
        SELECT 
            f.id, f.loan_id, f.amount, f.payment_status, f.paid_amount,
            (f.amount - COALESCE(f.paid_amount, 0)) as balance,
            f.reason, f.due_date, f.created_at, f.paid_at,
            l.book_id, l.loan_date, l.due_date as loan_due_date,
            l.return_date,
            DATEDIFF(COALESCE(l.return_date, NOW()), l.due_date) as days_overdue,
            b.title as book_title, b.author as book_author, b.isbn, b.cover_image,
            p.id as last_payment_id, p.tx_ref as last_payment_ref,
            p.status as last_payment_status, p.created_at as last_payment_date
        FROM   fines f
        LEFT   JOIN loans l ON l.id = f.loan_id
        LEFT   JOIN books b ON b.id = l.book_id
        LEFT   JOIN payments p ON p.id = f.payment_id
        WHERE  f.user_id = ? AND f.payment_status IN ('unpaid', 'partial')
        ORDER  BY f.created_at DESC
    ");
    $stmt->execute([$userId]);
    $fines = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get summary
    $sumStmt = $db->prepare("
        SELECT 
            COUNT(*) as total_unpaid,
            COALESCE(SUM(amount - paid_amount), 0) as total_balance,
            COALESCE(SUM(amount), 0) as total_original_amount,
            COALESCE(SUM(paid_amount), 0) as total_paid_amount
        FROM   fines
        WHERE  user_id = ? AND payment_status IN ('unpaid', 'partial')
    ");
    $sumStmt->execute([$userId]);
    $summary = $sumStmt->fetch(PDO::FETCH_ASSOC);

    $canBorrow = intval($summary['total_unpaid'] ?? 0) === 0;

    // Get pending payments
    $pendStmt = $db->prepare("
        SELECT 
            p.id, p.tx_ref, p.fine_id, p.amount, p.currency,
            p.status, p.checkout_url, p.created_at, f.amount as fine_amount
        FROM   payments p
        JOIN   fines f ON f.id = p.fine_id
        WHERE  p.user_id = ? AND p.status = 'pending'
        AND    p.created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        ORDER  BY p.created_at DESC
    ");
    $pendStmt->execute([$userId]);
    $pendingPayments = $pendStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format fines
    $formatted = array_map(function($f) {
        return [
            'id'               => intval($f['id']),
            'loan_id'          => intval($f['loan_id']),
            'amount'           => floatval($f['amount']),
            'payment_status'   => $f['payment_status'],
            'paid_amount'      => floatval($f['paid_amount']),
            'balance'          => floatval($f['balance']),
            'reason'           => $f['reason'],
            'due_date'         => $f['due_date'],
            'created_at'       => $f['created_at'],
            'paid_at'          => $f['paid_at'],
            'book'             => [
                'id'           => intval($f['book_id']),
                'title'        => $f['book_title'],
                'author'       => $f['book_author'],
                'isbn'         => $f['isbn'],
                'cover_image'  => $f['cover_image'],
            ],
            'loan'             => [
                'loan_date'    => $f['loan_date'],
                'due_date'     => $f['loan_due_date'],
                'return_date'  => $f['return_date'],
                'days_overdue' => intval($f['days_overdue']),
            ],
            'last_payment'     => $f['last_payment_id'] ? [
                'id'     => intval($f['last_payment_id']),
                'tx_ref' => $f['last_payment_ref'],
                'status' => $f['last_payment_status'],
                'date'   => $f['last_payment_date'],
            ] : null,
        ];
    }, $fines);

    // Format pending payments
    $pendingFormatted = array_map(function($p) {
        return [
            'id'          => intval($p['id']),
            'tx_ref'      => $p['tx_ref'],
            'fine_id'     => intval($p['fine_id']),
            'amount'      => floatval($p['amount']),
            'currency'    => $p['currency'],
            'status'      => $p['status'],
            'checkout_url' => $p['checkout_url'],
            'created_at'  => $p['created_at'],
        ];
    }, $pendingPayments);

    echo json_encode([
        'success'             => true,
        'fines'               => $formatted,
        'summary'             => [
            'total_unpaid'           => intval($summary['total_unpaid'] ?? 0),
            'total_balance'          => floatval($summary['total_balance'] ?? 0),
            'total_original_amount'  => floatval($summary['total_original_amount'] ?? 0),
            'total_paid_amount'      => floatval($summary['total_paid_amount'] ?? 0),
            'can_borrow'             => $canBorrow,
            'currency'               => 'ETB',
        ],
        'pending_payments'    => $pendingFormatted,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
