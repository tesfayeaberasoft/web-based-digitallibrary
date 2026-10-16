<?php
/**
 * Admin Financial Reports API
 * GET /api/admin/financial-reports?type=overview|details|revenue
 *
 * Comprehensive financial reporting for admins including payment history,
 * transaction logs, revenue analytics, and user payment tracking.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

header('Content-Type: application/json');

try {
    // Verify auth - admin only
    $decoded = requireAuth();
    if ($decoded['role'] !== 'admin') {
        http_response_code(403);
        throw new Exception('Access denied. Admins only.');
    }

    $type = $_GET['type'] ?? 'overview';
    $db = Database::getInstance()->getConnection();

    switch ($type) {
        case 'overview':
            $overview = getFinancialOverview($db);
            echo json_encode([
                'success' => true,
                'type' => 'overview',
                'data' => $overview,
            ]);
            break;

        case 'details':
            $details = getPaymentDetails($db);
            echo json_encode([
                'success' => true,
                'type' => 'details',
                'data' => $details,
            ]);
            break;

        case 'revenue':
            $revenue = getRevenueAnalytics($db);
            echo json_encode([
                'success' => true,
                'type' => 'revenue',
                'data' => $revenue,
            ]);
            break;

        case 'user-payments':
            $userId = intval($_GET['user_id'] ?? 0);
            if ($userId <= 0) {
                throw new Exception('user_id parameter required');
            }
            $userPayments = getUserPaymentHistory($db, $userId);
            echo json_encode([
                'success' => true,
                'type' => 'user-payments',
                'user_id' => $userId,
                'data' => $userPayments,
            ]);
            break;

        case 'date-range':
            $fromDate = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
            $toDate = $_GET['to'] ?? date('Y-m-d');
            $range = getRevenueByDateRange($db, $fromDate, $toDate);
            echo json_encode([
                'success' => true,
                'type' => 'date-range',
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'data' => $range,
            ]);
            break;

        default:
            throw new Exception('Invalid report type. Use: overview, details, revenue, user-payments, date-range');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

/**
 * Get financial overview dashboard data
 */
function getFinancialOverview($db) {
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_payments,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
            COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_revenue,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_revenue,
            AVG(CASE WHEN status = 'success' THEN amount ELSE NULL END) as avg_transaction_amount,
            MIN(created_at) as first_payment_date,
            MAX(created_at) as last_payment_date
        FROM payments
    ");
    $transactions = $stmt->fetch(PDO::FETCH_ASSOC);

    // Fines summary
    $finesStmt = $db->query("
        SELECT 
            COUNT(*) as total_fines,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_fines,
            SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
            SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_fines,
            COALESCE(SUM(amount), 0) as total_fine_amount,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as paid_fine_amount,
            COALESCE(SUM(CASE WHEN payment_status IN ('unpaid', 'partial') THEN amount - COALESCE(paid_amount, 0) ELSE 0 END), 0) as outstanding_balance
        FROM fines
    ");
    $fines = $finesStmt->fetch(PDO::FETCH_ASSOC);

    return [
        // Flat structure for frontend compatibility
        'total_revenue'          => floatval($transactions['total_revenue']),
        'total_transactions'     => intval($transactions['total_transactions']),
        'average_payment'        => floatval($transactions['avg_transaction_amount'] ?? 0),
        'successful_payments'    => intval($transactions['successful_payments']),
        'failed_payments'        => intval($transactions['failed_payments']),
        'pending_payments'       => intval($transactions['pending_payments']),
        'pending_revenue'        => floatval($transactions['pending_revenue']),
        'first_payment_date'     => $transactions['first_payment_date'],
        'last_payment_date'      => $transactions['last_payment_date'],
        
        // Fines info
        'total_fines'            => intval($fines['total_fines']),
        'paid_fines'             => intval($fines['paid_fines']),
        'unpaid_fines'           => intval($fines['unpaid_fines']),
        'partial_fines'          => intval($fines['partial_fines']),
        'total_fine_amount'      => floatval($fines['total_fine_amount']),
        'paid_fine_amount'       => floatval($fines['paid_fine_amount']),
        'outstanding_balance'    => floatval($fines['outstanding_balance']),
        
        // Metrics
        'payment_success_rate'   => $transactions['total_transactions'] > 0 
            ? round((intval($transactions['successful_payments']) / intval($transactions['total_transactions'])) * 100, 2)
            : 0,
        'collection_rate'        => floatval($fines['total_fine_amount']) > 0
            ? round((floatval($fines['paid_fine_amount']) / floatval($fines['total_fine_amount'])) * 100, 2)
            : 0,
    ];
}

/**
 * Get detailed payment transaction records
 */
function getPaymentDetails($db) {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(1, intval($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    $where = [];
    $params = [];

    if ($status) {
        $where[] = "p.status = ?";
        $params[] = $status;
    }

    if ($search) {
        $where[] = "(u.full_name LIKE ? OR u.email LIKE ? OR p.tx_ref LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM payments p JOIN users u ON p.user_id = u.id $whereSQL");
    $countStmt->execute($params);
    $total = intval($countStmt->fetch(PDO::FETCH_ASSOC)['total']);

    // Get paginated data
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.tx_ref,
            p.user_id,
            p.fine_id,
            p.amount,
            p.currency,
            p.status,
            p.payment_method,
            p.chapa_reference,
            p.verified_at,
            p.created_at,
            p.updated_at,
            
            u.full_name,
            u.email,
            u.user_id AS student_id,
            
            f.amount as fine_amount,
            f.payment_status,
            f.description as fine_description,
            
            pl.event_type,
            pl.status_before,
            pl.status_after
            
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN fines f ON p.fine_id = f.id
        LEFT JOIN (
            SELECT payment_id, event_type, status_before, status_after, created_at
            FROM payment_logs
            WHERE event_type IN ('verification', 'callback')
            ORDER BY created_at DESC
        ) pl ON p.id = pl.payment_id
        
        $whereSQL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");

    $params[] = $limit;
    $params[] = $offset;

    // Bind parameters
    $paramIndex = 1;
    foreach (array_slice($params, 0, count($params) - 2) as $param) {
        $stmt->bindValue($paramIndex++, $param);
    }
    $stmt->bindValue($paramIndex++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($paramIndex++, $offset, PDO::PARAM_INT);

    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($txn) {
        return [
            'payment_id'        => intval($txn['id']),
            'tx_ref'            => $txn['tx_ref'],
            'student_name'      => $txn['full_name'],
            'amount'            => floatval($txn['amount']),
            'currency'          => $txn['currency'],
            'payment_status'    => $txn['status'],  // Changed from 'status' to 'payment_status' for frontend
            'payment_method'    => $txn['payment_method'],
            'payment_date'      => $txn['created_at'],  // Added payment_date field
            'chapa_reference'   => $txn['chapa_reference'],
            'verified_at'       => $txn['verified_at'],
            'created_at'        => $txn['created_at'],
            'updated_at'        => $txn['updated_at'],
            'user'              => [
                'id'            => intval($txn['user_id']),
                'name'          => $txn['full_name'],
                'email'         => $txn['email'],
                'student_id'    => $txn['student_id'],
            ],
            'fine'              => [
                'id'            => intval($txn['fine_id']),
                'amount'        => floatval($txn['fine_amount']),
                'status'        => $txn['payment_status'],
                'description'   => $txn['fine_description'],
            ],
        ];
    }, $transactions);

    return $formatted;
}

/**
 * Get revenue analytics — returns a flat monthly array expected by the frontend.
 */
function getRevenueAnalytics($db) {
    // Monthly revenue for the last 12 months (flat array matching frontend expectations)
    $stmt = $db->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') AS month,
            COUNT(*) AS transaction_count,
            COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) AS revenue
        FROM payments
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return array_map(function($r) {
        return [
            'month'             => $r['month'],
            'transaction_count' => intval($r['transaction_count']),
            'revenue'           => floatval($r['revenue']),
        ];
    }, $rows);
}

/**
 * Get specific user payment history
 */
function getUserPaymentHistory($db, $userId) {
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.tx_ref,
            p.amount,
            p.currency,
            p.status,
            p.payment_method,
            p.verified_at,
            p.created_at,
            
            f.id as fine_id,
            f.amount as fine_amount,
            f.payment_status,
            f.description,
            
            pl.event_type,
            pl.status_before,
            pl.status_after
            
        FROM payments p
        JOIN fines f ON p.fine_id = f.id
        LEFT JOIN payment_logs pl ON p.id = pl.payment_id
        
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    
    $stmt->execute([$userId]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return array_map(function($p) {
        return [
            'payment_id'    => intval($p['id']),
            'tx_ref'        => $p['tx_ref'],
            'amount'        => floatval($p['amount']),
            'currency'      => $p['currency'],
            'status'        => $p['status'],
            'payment_method' => $p['payment_method'],
            'verified_at'   => $p['verified_at'],
            'created_at'    => $p['created_at'],
            'fine'          => [
                'id'        => intval($p['fine_id']),
                'amount'    => floatval($p['fine_amount']),
                'status'    => $p['payment_status'],
                'description' => $p['description'],
            ],
        ];
    }, $payments);
}

/**
 * Get revenue for a specific date range
 */
function getRevenueByDateRange($db, $fromDate, $toDate) {
    $stmt = $db->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as transaction_count,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_count,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as revenue,
            COALESCE(SUM(amount), 0) as total_amount,
            AVG(CASE WHEN status = 'success' THEN amount ELSE NULL END) as avg_successful_amount
        FROM payments
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    ");
    
    $stmt->execute([$fromDate, $toDate]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate totals
    $totals = [
        'total_transactions' => 0,
        'total_successful'   => 0,
        'total_failed'       => 0,
        'total_revenue'      => 0.0,
    ];

    $formatted = array_map(function($d) use (&$totals) {
        $totals['total_transactions'] += intval($d['transaction_count']);
        $totals['total_successful'] += intval($d['successful_count']);
        $totals['total_failed'] += intval($d['failed_count']);
        $totals['total_revenue'] += floatval($d['revenue']);

        return [
            'date'                  => $d['date'],
            'transaction_count'     => intval($d['transaction_count']),
            'successful_count'      => intval($d['successful_count']),
            'failed_count'          => intval($d['failed_count']),
            'pending_count'         => intval($d['pending_count']),
            'revenue'               => floatval($d['revenue']),
            'avg_successful_amount' => floatval($d['avg_successful_amount'] ?? 0),
        ];
    }, $data);

    return [
        'date_range'    => [
            'from'  => $fromDate,
            'to'    => $toDate,
        ],
        'by_day'        => $formatted,
        'totals'        => $totals,
    ];
}
?>
