<?php
/**
 * List Users Endpoint (Admin/Librarian only)
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

try {
    // Require authentication and check role
    $decoded = requireAuth();
    
    // Only allow admin and librarian roles
    if (!in_array($decoded['role'], ['admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }

    $db = Database::getInstance()->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';

    $offset = ($page - 1) * $limit;

    // Build query
    $whereConditions = [];
    $params = [];

    if (!empty($search)) {
        $whereConditions[] = "(full_name LIKE :search OR email LIKE :search OR user_id LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if (!empty($role)) {
        $whereConditions[] = "role = :role";
        $params[':role'] = $role;
    }

    if (!empty($status)) {
        if ($status === 'non-active') {
            // Special case: show all users that are not active (inactive, suspended, etc.)
            $whereConditions[] = "status != 'active'";
        } else {
            $whereConditions[] = "status = :status";
            $params[':status'] = $status;
        }
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Count total records
    $countQuery = "SELECT COUNT(*) as total FROM users $whereClause";
    $countStmt = $db->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];

    // Get users
    $query = "SELECT id, user_id, full_name, email, phone, address, role, status, 
                     profile_image, created_at, last_login
              FROM users 
              $whereClause
              ORDER BY created_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $users = $stmt->fetchAll();

    // Get additional stats for each user
    foreach ($users as &$user) {
        // Count active loans
        $loanQuery = "SELECT COUNT(*) as count FROM book_loans 
                      WHERE user_id = :user_id AND status = 'active'";
        $loanStmt = $db->prepare($loanQuery);
        $loanStmt->bindParam(':user_id', $user['id']);
        $loanStmt->execute();
        $user['active_loans'] = $loanStmt->fetch()['count'];

        // Get total fines
        $fineQuery = "SELECT COALESCE(SUM(amount - paid_amount), 0) as total 
                      FROM fines 
                      WHERE user_id = :user_id AND status != 'paid'";
        $fineStmt = $db->prepare($fineQuery);
        $fineStmt->bindParam(':user_id', $user['id']);
        $fineStmt->execute();
        $user['unpaid_fines'] = (float)$fineStmt->fetch()['total'];
    }

    echo json_encode([
        'success' => true,
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching users',
        'error' => $e->getMessage()
    ]);
}
?>