<?php
/**
 * Import Books from CSV
 * POST /api/books/import
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only librarians and admins can import books
    if (!in_array($decoded['role'], ['librarian', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No CSV file uploaded']);
        exit;
    }
    
    $file = $_FILES['csv_file'];
    
    // Validate file type
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($fileInfo, $file['tmp_name']);
    finfo_close($fileInfo);
    
    if (!in_array($mimeType, ['text/csv', 'text/plain', 'application/csv'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Please upload a CSV file.']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    
    // Read and parse CSV
    $csvData = [];
    $errors = [];
    $imported_count = 0;
    
    if (($handle = fopen($file['tmp_name'], 'r')) !== FALSE) {
        $headers = fgetcsv($handle); // Read header row
        
        if (!$headers) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid CSV format']);
            exit;
        }
        
        // Normalize headers (remove quotes and trim)
        $headers = array_map(function($h) { return trim($h, '"'); }, $headers);
        
        // Required columns
        $required_columns = ['title', 'author', 'isbn', 'category_id', 'total_copies'];
        $missing_columns = array_diff($required_columns, $headers);
        
        if (!empty($missing_columns)) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Missing required columns: ' . implode(', ', $missing_columns)
            ]);
            exit;
        }
        
        $row_number = 1;
        
        // Begin transaction
        $db->beginTransaction();
        
        try {
            while (($data = fgetcsv($handle)) !== FALSE) {
                $row_number++;
                
                if (count($data) !== count($headers)) {
                    $errors[] = "Row $row_number: Column count mismatch";
                    continue;
                }
                
                // Create associative array
                $row = array_combine($headers, $data);
                
                // Clean data (remove quotes)
                $row = array_map(function($value) { return trim($value, '"'); }, $row);
                
                // Validate required fields
                $row_errors = [];
                if (empty($row['title'])) $row_errors[] = 'Title is required';
                if (empty($row['author'])) $row_errors[] = 'Author is required';
                if (empty($row['isbn'])) $row_errors[] = 'ISBN is required';
                if (empty($row['category_id']) || !is_numeric($row['category_id'])) {
                    $row_errors[] = 'Valid category ID is required';
                }
                if (empty($row['total_copies']) || !is_numeric($row['total_copies']) || $row['total_copies'] < 1) {
                    $row_errors[] = 'Valid total copies (>= 1) is required';
                }
                
                if (!empty($row_errors)) {
                    $errors[] = "Row $row_number: " . implode(', ', $row_errors);
                    continue;
                }
                
                // Check if ISBN already exists
                $stmt = $db->prepare("SELECT id FROM books WHERE isbn = ?");
                $stmt->execute([$row['isbn']]);
                if ($stmt->fetch()) {
                    $errors[] = "Row $row_number: ISBN {$row['isbn']} already exists";
                    continue;
                }
                
                // Check if category exists
                $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
                $stmt->execute([$row['category_id']]);
                if (!$stmt->fetch()) {
                    $errors[] = "Row $row_number: Category ID {$row['category_id']} not found";
                    continue;
                }
                
                // Prepare book data
                $book_data = [
                    'title' => $row['title'],
                    'author' => $row['author'],
                    'isbn' => $row['isbn'],
                    'category_id' => intval($row['category_id']),
                    'total_copies' => intval($row['total_copies']),
                    'available_copies' => intval($row['total_copies']),
                    'publisher' => $row['publisher'] ?? null,
                    'publication_year' => !empty($row['publication_year']) && is_numeric($row['publication_year']) ? intval($row['publication_year']) : null,
                    'description' => $row['description'] ?? null,
                    'language' => $row['language'] ?? 'English',
                    'pages' => !empty($row['pages']) && is_numeric($row['pages']) ? intval($row['pages']) : null,
                    'status' => 'active'
                ];
                
                // Insert book
                $sql = "INSERT INTO books (title, author, isbn, category_id, publisher, publication_year, 
                        description, language, pages, total_copies, available_copies, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $db->prepare($sql);
                $stmt->execute([
                    $book_data['title'],
                    $book_data['author'],
                    $book_data['isbn'],
                    $book_data['category_id'],
                    $book_data['publisher'],
                    $book_data['publication_year'],
                    $book_data['description'],
                    $book_data['language'],
                    $book_data['pages'],
                    $book_data['total_copies'],
                    $book_data['available_copies'],
                    $book_data['status']
                ]);
                
                $imported_count++;
            }
            
            $db->commit();
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
        
        fclose($handle);
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Import completed. $imported_count books imported successfully.",
        'imported_count' => $imported_count,
        'errors' => $errors,
        'total_errors' => count($errors)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>