<?php
/**
 * Super Admin Audit & Activity Log API
 * GET /api/super-admin/audit-logs — list with filters & pagination
 * GET /api/super-admin/audit-logs?export=csv — CSV export for date range
 */

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';

    $decoded = requireAuth();
    if ($decoded['role'] !== 'super-admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Super admin access required']);
        exit;
    }

    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    if (!auditLogsTableExists($db)) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => [
                'items' => [],
                'pagination' => ['page' => 1, 'per_page' => 20, 'total' => 0, 'total_pages' => 0],
                'filter_options' => ['actions' => [], 'tables' => []],
                'summary' => ['total' => 0],
            ],
            'message' => 'Audit log table not found',
        ]);
        exit;
    }

    $filters = parseAuditLogFilters($_GET);

    if (isset($_GET['export']) && $_GET['export'] === 'csv') {
        exportAuditLogsCsv($db, $filters);
        exit;
    }

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => fetchAuditLogs($db, $filters),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Failed to load audit logs: ' . $e->getMessage()]);
}

function auditLogsTableExists($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'audit_logs'");
        return (bool) $stmt->fetchColumn();
    } catch (Exception $e) {
        return false;
    }
}

function parseAuditLogFilters($query) {
    $page = max(1, (int) ($query['page'] ?? 1));
    $perPage = max(1, min(100, (int) ($query['per_page'] ?? 20)));

    $dateFrom = trim($query['date_from'] ?? '');
    $dateTo = trim($query['date_to'] ?? '');

    if ($dateFrom !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
        $dateFrom = '';
    }
    if ($dateTo !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
        $dateTo = '';
    }

    if ($dateFrom === '' && $dateTo === '') {
        $dateTo = date('Y-m-d');
        $dateFrom = date('Y-m-d', strtotime('-30 days'));
    }

    return [
        'page' => $page,
        'per_page' => $perPage,
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
        'user_id' => isset($query['user_id']) && $query['user_id'] !== '' ? (int) $query['user_id'] : null,
        'user_search' => trim($query['user_search'] ?? ''),
        'action' => trim($query['action'] ?? ''),
        'table_name' => trim($query['table_name'] ?? ''),
    ];
}

function buildAuditLogWhereClause(array $filters) {
    $where = ['1=1'];
    $params = [];

    if (!empty($filters['date_from'])) {
        $where[] = 'al.created_at >= ?';
        $params[] = $filters['date_from'] . ' 00:00:00';
    }
    if (!empty($filters['date_to'])) {
        $where[] = 'al.created_at <= ?';
        $params[] = $filters['date_to'] . ' 23:59:59';
    }
    if (!empty($filters['user_id'])) {
        $where[] = 'al.user_id = ?';
        $params[] = $filters['user_id'];
    }
    if ($filters['user_search'] !== '') {
        $where[] = '(u.full_name LIKE ? OR u.email LIKE ? OR u.user_id LIKE ?)';
        $term = '%' . $filters['user_search'] . '%';
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }
    if ($filters['action'] !== '') {
        $where[] = 'al.action = ?';
        $params[] = $filters['action'];
    }
    if ($filters['table_name'] !== '') {
        $where[] = 'al.table_name = ?';
        $params[] = $filters['table_name'];
    }

    return [
        'sql' => implode(' AND ', $where),
        'params' => $params,
    ];
}

function normalizeAuditLogRow(array $row) {
    foreach (['old_values', 'new_values'] as $key) {
        if (!isset($row[$key]) || $row[$key] === null || $row[$key] === '') {
            $row[$key] = null;
            continue;
        }
        if (is_string($row[$key])) {
            $decoded = json_decode($row[$key], true);
            $row[$key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $row[$key];
        }
    }
    $row['id'] = (int) $row['id'];
    $row['user_id'] = $row['user_id'] !== null ? (int) $row['user_id'] : null;
    $row['record_id'] = $row['record_id'] !== null ? (int) $row['record_id'] : null;
    return $row;
}

function fetchAuditLogs($db, array $filters) {
    $where = buildAuditLogWhereClause($filters);
    $baseFrom = "
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE {$where['sql']}
    ";

    $countStmt = $db->prepare("SELECT COUNT(*) {$baseFrom}");
    $countStmt->execute($where['params']);
    $total = (int) $countStmt->fetchColumn();

    $perPage = $filters['per_page'];
    $page = $filters['page'];
    $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 0;
    if ($totalPages > 0 && $page > $totalPages) {
        $page = $totalPages;
    }
    $offset = ($page - 1) * $perPage;

    $listStmt = $db->prepare("
        SELECT
            al.id,
            al.user_id,
            u.full_name AS user_name,
            u.email AS user_email,
            u.role AS user_role,
            u.user_id AS user_code,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.ip_address,
            al.user_agent,
            al.created_at
        {$baseFrom}
        ORDER BY al.created_at DESC, al.id DESC
        LIMIT {$perPage} OFFSET {$offset}
    ");
    $listStmt->execute($where['params']);
    $items = array_map('normalizeAuditLogRow', $listStmt->fetchAll(PDO::FETCH_ASSOC));

    return [
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages,
            'has_prev' => $page > 1,
            'has_next' => $page < $totalPages,
        ],
        'filter_options' => fetchAuditLogFilterOptions($db, $filters),
        'summary' => [
            'total' => $total,
            'date_from' => $filters['date_from'],
            'date_to' => $filters['date_to'],
        ],
        'applied_filters' => $filters,
    ];
}

function fetchAuditLogFilterOptions($db, array $filters) {
    $where = buildAuditLogWhereClause([
        'date_from' => $filters['date_from'],
        'date_to' => $filters['date_to'],
        'user_id' => null,
        'user_search' => '',
        'action' => '',
        'table_name' => '',
        'page' => 1,
        'per_page' => 20,
    ]);

    $actionsStmt = $db->prepare("
        SELECT DISTINCT al.action
        FROM audit_logs al
        WHERE {$where['sql']}
        ORDER BY al.action ASC
    ");
    $actionsStmt->execute($where['params']);
    $actions = $actionsStmt->fetchAll(PDO::FETCH_COLUMN);

    $tablesStmt = $db->prepare("
        SELECT DISTINCT al.table_name
        FROM audit_logs al
        WHERE {$where['sql']} AND al.table_name IS NOT NULL AND al.table_name != ''
        ORDER BY al.table_name ASC
    ");
    $tablesStmt->execute($where['params']);
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    return [
        'actions' => array_values(array_filter($actions)),
        'tables' => array_values(array_filter($tables)),
    ];
}

function exportAuditLogsCsv($db, array $filters) {
    $exportFilters = $filters;
    $exportFilters['page'] = 1;
    $exportFilters['per_page'] = 10000;

    $data = fetchAuditLogs($db, $exportFilters);
    $items = $data['items'];

    $filename = 'audit_logs_' . ($filters['date_from'] ?: 'all') . '_to_' . ($filters['date_to'] ?: 'all') . '.csv';

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store');

    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

    fputcsv($out, [
        'ID',
        'Date/Time',
        'User',
        'Email',
        'Role',
        'Action',
        'Table',
        'Record ID',
        'IP Address',
        'Old Values',
        'New Values',
    ]);

    foreach ($items as $row) {
        fputcsv($out, [
            $row['id'],
            $row['created_at'],
            $row['user_name'] ?? 'System',
            $row['user_email'] ?? '',
            $row['user_role'] ?? '',
            $row['action'],
            $row['table_name'] ?? '',
            $row['record_id'] ?? '',
            $row['ip_address'] ?? '',
            $row['old_values'] !== null ? json_encode($row['old_values']) : '',
            $row['new_values'] !== null ? json_encode($row['new_values']) : '',
        ]);
    }

    fclose($out);
    exit;
}
