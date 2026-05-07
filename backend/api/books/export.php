<?php
/**
 * Export Books to CSV/Excel
 * GET /api/books/export
 */

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can export books
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Get parameters
    $format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $category_id = isset($_GET['category_id']) ? $_GET['category_id'] : '';
    
    // Build query
    $sql = "
        SELECT 
            b.id,
            b.title,
            b.author,
            b.isbn,
            b.publisher,
            b.publication_year,
            c.name as category_name,
            b.description,
            b.language,
            b.pages,
            b.total_copies,
            b.available_copies,
            b.status,
            b.created_at
        FROM books b
        LEFT JOIN categories c ON c.id = b.category_id
        WHERE 1=1
    ";
    
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)";
        $search_param = "%$search%";
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }
    
    if (!empty($category_id)) {
        $sql .= " AND b.category_id = ?";
        $params[] = $category_id;
    }
    
    $sql .= " ORDER BY b.title ASC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($format === 'csv') {
        // CSV Export
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="books_inventory_' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // CSV Headers
        $headers = [
            'ID', 'Title', 'Author', 'ISBN', 'Publisher', 'Publication Year',
            'Category', 'Description', 'Language', 'Pages', 'Total Copies',
            'Available Copies', 'Status', 'Created Date'
        ];
        
        fputcsv($output, $headers);
        
        // CSV Data
        foreach ($books as $book) {
            $row = [
                $book['id'],
                $book['title'],
                $book['author'],
                $book['isbn'],
                $book['publisher'] ?? '',
                $book['publication_year'] ?? '',
                $book['category_name'] ?? 'Uncategorized',
                $book['description'] ?? '',
                $book['language'] ?? 'English',
                $book['pages'] ?? '',
                $book['total_copies'],
                $book['available_copies'],
                $book['status'],
                date('Y-m-d H:i:s', strtotime($book['created_at']))
            ];
            fputcsv($output, $row);
        }
        
        fclose($output);
        
    } elseif ($format === 'xlsx') {
        // Excel Export (Simple XML format)
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="books_inventory_' . date('Y-m-d') . '.xlsx"');
        
        // Create simple Excel XML
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' . "\n";
        echo '<Worksheet ss:Name="Books Inventory">' . "\n";
        echo '<Table>' . "\n";
        
        // Headers
        echo '<Row>' . "\n";
        $headers = [
            'ID', 'Title', 'Author', 'ISBN', 'Publisher', 'Publication Year',
            'Category', 'Description', 'Language', 'Pages', 'Total Copies',
            'Available Copies', 'Status', 'Created Date'
        ];
        
        foreach ($headers as $header) {
            echo '<Cell><Data ss:Type="String">' . htmlspecialchars($header) . '</Data></Cell>' . "\n";
        }
        echo '</Row>' . "\n";
        
        // Data rows
        foreach ($books as $book) {
            echo '<Row>' . "\n";
            
            $row = [
                $book['id'],
                $book['title'],
                $book['author'],
                $book['isbn'],
                $book['publisher'] ?? '',
                $book['publication_year'] ?? '',
                $book['category_name'] ?? 'Uncategorized',
                $book['description'] ?? '',
                $book['language'] ?? 'English',
                $book['pages'] ?? '',
                $book['total_copies'],
                $book['available_copies'],
                $book['status'],
                date('Y-m-d H:i:s', strtotime($book['created_at']))
            ];
            
            foreach ($row as $index => $cell) {
                $type = ($index === 0 || $index === 5 || $index === 9 || $index === 10 || $index === 11) ? 'Number' : 'String';
                echo '<Cell><Data ss:Type="' . $type . '">' . htmlspecialchars($cell) . '</Data></Cell>' . "\n";
            }
            echo '</Row>' . "\n";
        }
        
        echo '</Table>' . "\n";
        echo '</Worksheet>' . "\n";
        echo '</Workbook>' . "\n";
        
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid format. Use csv or xlsx.']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>