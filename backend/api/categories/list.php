<?php
/**
 * List Categories
 * GET /api/categories
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed');
    }
    
    // Get all categories with book count
    $stmt = $db->prepare("
        SELECT 
            c.*,
            COUNT(b.id) as book_count
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id AND b.status = 'active'
        GROUP BY c.id
        ORDER BY c.name ASC
    ");
    
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (Throwable $e) {
    error_log('Category list query failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 'CATEGORY_LIST_QUERY_FAILED',
        'message' => 'Unable to load book categories.'
    ]);
}
?>
