<?php
/**
 * Upload or replace a book's digital content.
 * POST /api/books/{id}/ebook
 */

header('Content-Type: application/json');

$uploadedEbook = null;

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../utils/ebook-storage.php';

    $user = requireAuth();
    if (!in_array(strtolower($user['role'] ?? ''), ['admin', 'librarian'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only admins and librarians can upload eBooks.']);
        exit;
    }

    $bookId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$bookId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid book ID.']);
        exit;
    }

    $uploadedEbook = storeEbookUpload($_FILES['ebook_file'] ?? null);
    if ($uploadedEbook === null) {
        throw new EbookUploadException('Select a PDF or EPUB file to upload.');
    }

    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }
    $stmt = $db->prepare('SELECT file_path FROM books WHERE id = ?');
    $stmt->execute([$bookId]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$book) {
        deleteStoredEbook($uploadedEbook['path']);
        $uploadedEbook = null;
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found.']);
        exit;
    }

    $stmt = $db->prepare('UPDATE books SET file_path = ?, file_type = ? WHERE id = ?');
    $stmt->execute([$uploadedEbook['path'], $uploadedEbook['type'], $bookId]);

    if (!empty($book['file_path'])) {
        deleteStoredEbook($book['file_path']);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Digital content uploaded successfully.',
        'file_type' => $uploadedEbook['type'],
    ]);
} catch (EbookUploadException $e) {
    if ($uploadedEbook !== null) {
        deleteStoredEbook($uploadedEbook['path']);
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} catch (Exception $e) {
    if ($uploadedEbook !== null) {
        deleteStoredEbook($uploadedEbook['path']);
    }
    error_log('eBook upload failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Digital content could not be uploaded.']);
}
