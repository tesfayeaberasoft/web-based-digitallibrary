<?php
/**
 * List Books Endpoint
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

try {
    $db = Database::getInstance()->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : DEFAULT_PAGE_SIZE;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $availability = isset($_GET['availability']) ? $_GET['availability'] : '';

    $offset = ($page - 1) * $limit;

    // Build query
    $whereConditions = [];
    $params = [];

    if (!empty($search)) {
        $whereConditions[] = "(b.title LIKE :search OR b.author LIKE :search OR b.isbn LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if (!empty($category)) {
        $whereConditions[] = "b.category_id = :category";
        $params[':category'] = $category;
    }

    if (!empty($status)) {
        $whereConditions[] = "b.status = :status";
        $params[':status'] = $status;
    }

    if ($availability === 'available') {
        $whereConditions[] = "b.available_copies > 0";
    } elseif ($availability === 'unavailable') {
        $whereConditions[] = "b.available_copies = 0";
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Count total records
    $countQuery = "SELECT COUNT(*) as total FROM books b $whereClause";
    $countStmt = $db->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];

    // Get books with category information
    $query = "SELECT b.*, c.name as category_name, c.color_code as category_color,
                     (SELECT AVG(rating) FROM book_reviews WHERE book_id = b.id) as avg_rating,
                     (SELECT COUNT(*) FROM book_reviews WHERE book_id = b.id) as review_count
              FROM books b
              LEFT JOIN categories c ON b.category_id = c.id
              $whereClause
              ORDER BY b.created_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $books = $stmt->fetchAll();

    // Format ratings
    foreach ($books as &$book) {
        $book['avg_rating'] = $book['avg_rating'] ? round((float)$book['avg_rating'], 1) : null;
        $book['review_count'] = (int)$book['review_count'];
        $book['is_available'] = $book['available_copies'] > 0;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'books' => $books,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching books',
        'error' => $e->getMessage()
    ]);
}
?>