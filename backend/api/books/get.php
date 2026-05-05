<?php
/**
 * Get Single Book Details
 * GET /api/books/{id}
 */

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    
    // Get book ID from URL
    $book_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($book_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid book ID'
        ]);
        exit;
    }
    
    // Get book details with category and availability
    $stmt = $db->prepare("
        SELECT 
            b.*,
            c.name as category_name,
            c.description as category_description,
            (b.total_copies - b.available_copies) as borrowed_count,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) as review_count,
            COUNT(DISTINCT bl.id) as total_borrows
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN book_reviews r ON b.id = r.book_id
        LEFT JOIN book_loans bl ON b.id = bl.book_id
        WHERE b.id = ?
        GROUP BY b.id
    ");
    
    $stmt->execute([$book_id]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Book not found'
        ]);
        exit;
    }
    
    // Get recent reviews
    $stmt = $db->prepare("
        SELECT 
            r.*,
            u.full_name as user_name
        FROM book_reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.book_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5
    ");
    
    $stmt->execute([$book_id]);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $book['reviews'] = $reviews;
    $book['avg_rating'] = round(floatval($book['avg_rating']), 1);
    
    echo json_encode([
        'success' => true,
        'book' => $book
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
