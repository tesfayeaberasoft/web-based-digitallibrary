<?php
/**
 * Bulk Update Books
 * PUT /api/books/bulk-update
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can perform bulk operations
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['book_ids']) || !is_array($data['book_ids']) || empty($data['book_ids'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Book IDs are required']);
        exit;
    }
    
    if (!isset($data['action']) || !in_array($data['action'], ['category', 'status', 'condition'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    $book_ids = array_map('intval', $data['book_ids']);
    $action = $data['action'];
    $updated_count = 0;
    
    // Validate book IDs exist
    $placeholders = str_repeat('?,', count($book_ids) - 1) . '?';
    $stmt = $db->prepare("SELECT id FROM books WHERE id IN ($placeholders)");
    $stmt->execute($book_ids);
    $existing_books = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($existing_books) !== count($book_ids)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Some books not found']);
        exit;
    }
    
    if ($action === 'category') {
        if (!isset($data['category_id']) || !is_numeric($data['category_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category ID is required']);
            exit;
        }
        
        $category_id = intval($data['category_id']);
        
        // Validate category exists
        $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
        $stmt->execute([$category_id]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category not found']);
            exit;
        }
        
        // Update category for all selected books
        $stmt = $db->prepare("UPDATE books SET category_id = ? WHERE id IN ($placeholders)");
        $params = array_merge([$category_id], $book_ids);
        $stmt->execute($params);
        $updated_count = $stmt->rowCount();
        
    } elseif ($action === 'status') {
        if (!isset($data['status']) || !in_array($data['status'], ['active', 'inactive', 'maintenance'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid status is required']);
            exit;
        }
        
        $status = $data['status'];
        
        // Update status for all selected books
        $stmt = $db->prepare("UPDATE books SET status = ? WHERE id IN ($placeholders)");
        $params = array_merge([$status], $book_ids);
        $stmt->execute($params);
        $updated_count = $stmt->rowCount();
        
    } elseif ($action === 'condition') {
        if (!isset($data['condition_status']) || !in_array($data['condition_status'], ['new', 'good', 'fair', 'poor', 'damaged'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid condition is required']);
            exit;
        }
        
        $condition_status = $data['condition_status'];
        
        // Update condition for all selected books
        $stmt = $db->prepare("UPDATE books SET condition_status = ? WHERE id IN ($placeholders)");
        $params = array_merge([$condition_status], $book_ids);
        $stmt->execute($params);
        $updated_count = $stmt->rowCount();
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully updated $updated_count books",
        'updated_count' => $updated_count
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>