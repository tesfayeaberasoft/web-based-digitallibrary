<?php
/**
 * List Categories
 * GET /api/categories
 */

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    
    // Get all categories with book count
    $stmt = $db->prepare("
        SELECT 
            c.*,
            COUNT(b.id) as book_count
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id AND b.status = 'available'
        GROUP BY c.id
        ORDER BY c.name ASC
    ");
    
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
