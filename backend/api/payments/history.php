<?php
/**
 * Get Payment History for Current User
 * GET /api/payments/history?page=1&limit=20&status=success
 *
 * Returns paginated payment transaction history.
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
    $userRole = $decoded['role'] ?? 'user';

    $db = Database::getInstance()->getConnection();

    // Build conditions
    $where  = [];
    $params = [];

    if ($userRole === 'user') {
        $where[] = "p.user_id = ?";
        $params[] = $userId;
    } elseif (isset($_GET['user_id'])) {
        $where[] = "p.user_id = ?";
        $params[] = intval($_GET['user_id']);
    }

    if (isset($_GET['status'])) {
        $where[] = "p.status = ?";
        $params[] = $_GET['status'];
    }

    if (isset($_GET['fine_id'])) {
        $where[] = "p.fine_id = ?";
        $params[] = intval($_GET['fine_id']);
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Pagination
    $page  = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(1, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    // Total count
    $cnt = $db->prepare("SELECT COUNT(*) as total FROM payments p $whereSQL");
    $cnt->execute($params);
    $total = intval($cnt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    // Get payments
    $query = "
        SELECT 
            p.id, p.tx_ref, p.user_id, p.fine_id,
            p.amount, p.currency, p.status,
            p.chapa_reference, p.checkout_url, p.verified_at,
            p.customer_email, p.customer_phone, p.customer_name,
            p.payment_method, p.callback_attempts, p.last_callback_at,
            p.created_at, p.updated_at,
            f.amount as fine_amount,
            f.payment_status as fine_payment_status,
            f.reason as fine_reason,
            u.full_name as user_name, u.email as user_email,
            b.title as book_title, b.author as book_author, b.isbn
        FROM   payments p
        JOIN   fines f ON f.id = p.fine_id
        JOIN   users u ON u.id = p.user_id
        LEFT   JOIN loans l ON l.id = f.loan_id
        LEFT   JOIN books b ON b.id = l.book_id
        $whereSQL
        ORDER  BY p.created_at DESC
        LIMIT  ? OFFSET  ?
    ";

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format payments
    $formatted = array_map(function($p) {
        return [
            'id'               => intval($p['id']),
            'tx_ref'           => $p['tx_ref'],
            'amount'           => floatval($p['amount']),
            'currency'         => $p['currency'],
            'status'           => $p['status'],
            'chapa_reference'  => $p['chapa_reference'],
            'payment_method'   => $p['payment_method'],
            'verified_at'      => $p['verified_at'],
            'created_at'       => $p['created_at'],
            'updated_at'       => $p['updated_at'],
            'fine'             => [
                'id'            => intval($p['fine_id']),
                'amount'        => floatval($p['fine_amount']),
                'payment_status' => $p['fine_payment_status'],
                'reason'        => $p['fine_reason'],
            ],
            'user'             => [
                'id'    => intval($p['user_id']),
                'name'  => $p['user_name'],
                'email' => $p['user_email'],
            ],
            'book'             => $p['book_title'] ? [
                'title'  => $p['book_title'],
                'author' => $p['book_author'],
                'isbn'   => $p['isbn'],
            ] : null,
            'callback_info'    => [
                'attempts'      => intval($p['callback_attempts']),
                'last_attempt'  => $p['last_callback_at'],
            ],
        ];
    }, $payments);

    // Summary stats
    $sum = $db->prepare("
        SELECT 
            COUNT(*) as total_transactions,
            COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_paid,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
            COALESCE(SUM(CASE WHEN status = 'failed'  THEN amount ELSE 0 END), 0) as total_failed
        FROM   payments p
        $whereSQL
    ");
    $sum->execute(array_slice($params, 0, count($params) - 2));  // Exclude limit/offset
    $summary = $sum->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success'      => true,
        'payments'     => $formatted,
        'summary'      => [
            'total_transactions' => intval($summary['total_transactions'] ?? 0),
            'total_paid'         => floatval($summary['total_paid'] ?? 0),
            'total_pending'      => floatval($summary['total_pending'] ?? 0),
            'total_failed'       => floatval($summary['total_failed'] ?? 0),
            'currency'           => 'ETB',
        ],
        'pagination'   => [
            'page'  => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit),
        ],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
