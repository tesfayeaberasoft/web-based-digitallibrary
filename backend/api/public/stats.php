<?php
/**
 * Public Homepage Stats Endpoint
 * No authentication required — returns live stats for the homepage
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'code' => 'DATABASE_CONNECTION_FAILED',
            'message' => 'Unable to connect to the library database.',
        ]);
        exit;
    }

    // Total books
    $totalBooks = (int)$db->query("SELECT COUNT(*) FROM books WHERE status = 'active'")->fetchColumn();

    // Total members (users with role = 'user')
    $totalMembers = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active'")->fetchColumn();

    // Total loans ever
    $totalLoans = (int)$db->query("SELECT COUNT(*) FROM book_loans")->fetchColumn();

    // Active loans
    $activeLoans = (int)$db->query("SELECT COUNT(*) FROM book_loans WHERE status = 'active'")->fetchColumn();

    // Total categories
    $totalCategories = (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn();

    // Average book rating
    $avgRating = $db->query("SELECT ROUND(AVG(rating), 1) FROM book_reviews")->fetchColumn();
    $avgRating = $avgRating !== null ? (float)$avgRating : 0.0;

    // Total reviews
    $totalReviews = (int)$db->query("SELECT COUNT(*) FROM book_reviews")->fetchColumn();

    // Most popular books (most loaned)
    $popularBooks = $db->query(
        "SELECT b.title, b.author, b.cover_image, COUNT(bl.id) as loan_count
         FROM books b
         LEFT JOIN book_loans bl ON b.id = bl.book_id
         WHERE b.status = 'active'
         GROUP BY b.id
         ORDER BY loan_count DESC
         LIMIT 4"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Categories with book counts
    $categories = $db->query(
        "SELECT c.name, c.color_code, COUNT(b.id) as book_count
         FROM categories c
         LEFT JOIN books b ON c.id = b.category_id AND b.status = 'active'
         GROUP BY c.id
         ORDER BY book_count DESC
         LIMIT 6"
    )->fetchAll(PDO::FETCH_ASSOC);

    // Recent additions
    $recentBooks = $db->query(
        "SELECT title, author, created_at FROM books WHERE status = 'active' ORDER BY created_at DESC LIMIT 3"
    )->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'stats' => [
                'total_books'      => $totalBooks,
                'total_members'    => $totalMembers,
                'total_loans'      => $totalLoans,
                'active_loans'     => $activeLoans,
                'total_categories' => $totalCategories,
                'avg_rating'       => $avgRating,
                'total_reviews'    => $totalReviews,
            ],
            'popular_books'  => $popularBooks,
            'categories'     => $categories,
            'recent_books'   => $recentBooks,
        ],
    ]);

} catch (Throwable $e) {
    error_log('Public stats query failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 'STATISTICS_QUERY_FAILED',
        'message' => 'Unable to load library statistics.',
    ]);
}
?>
