<?php
/**
 * Test if books exist in database
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check books count
    $stmt = $db->query("SELECT COUNT(*) as count FROM books");
    $result = $stmt->fetch();
    echo "Total books in database: " . $result['count'] . "\n";
    
    // Check available books
    $stmt = $db->query("SELECT COUNT(*) as count FROM books WHERE status = 'available'");
    $result = $stmt->fetch();
    echo "Available books: " . $result['count'] . "\n";
    
    // Show first 5 books
    echo "\nFirst 5 books:\n";
    $stmt = $db->query("SELECT id, title, author, isbn, available_copies FROM books LIMIT 5");
    while ($book = $stmt->fetch()) {
        echo "  - [{$book['id']}] {$book['title']} by {$book['author']} (ISBN: {$book['isbn']}, Available: {$book['available_copies']})\n";
    }
    
    // Test the API endpoint directly
    echo "\n\nTesting API endpoint...\n";
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/books?page=1&limit=10';
    $_GET['page'] = 1;
    $_GET['limit'] = 10;
    $_GET['search'] = '';
    $_GET['category_id'] = '';
    
    ob_start();
    require __DIR__ . '/api/books/list.php';
    $output = ob_get_clean();
    
    echo "API Response:\n";
    echo $output . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
