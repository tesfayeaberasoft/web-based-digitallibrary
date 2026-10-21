<?php
/**
 * Authenticated, inline eBook streaming endpoint.
 * GET /api/books/{id}/content
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../utils/ebook-storage.php';

$user = requireAuth();
$allowedRoles = ['user', 'librarian', 'admin', 'super-admin'];
if (!in_array(strtolower($user['role'] ?? ''), $allowedRoles, true)) {
    http_response_code(403);
    exit;
}

$bookId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$bookId) {
    http_response_code(400);
    exit;
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }
    $stmt = $db->prepare("SELECT file_path, file_type FROM books WHERE id = ? AND status = 'active'");
    $stmt->execute([$bookId]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$book || empty($book['file_path'])) {
        http_response_code(404);
        exit;
    }

    $filePath = resolveEbookStoragePath($book['file_path']);
    if ($filePath === null || !is_file($filePath) || !is_readable($filePath)) {
        error_log('Stored eBook is missing or invalid for book ID ' . $bookId);
        http_response_code(404);
        exit;
    }

    $fileSize = filesize($filePath);
    $fileType = $book['file_type'] === 'epub' ? 'epub' : 'pdf';
    $mimeType = $fileType === 'epub' ? 'application/epub+zip' : 'application/pdf';
    $start = 0;
    $end = $fileSize - 1;
    $status = 200;
    $range = $_SERVER['HTTP_RANGE'] ?? '';

    if ($range !== '') {
        if (!preg_match('/\Abytes=(\d*)-(\d*)\z/', trim($range), $matches)
            || ($matches[1] === '' && $matches[2] === '')) {
            header("Content-Range: bytes */$fileSize");
            http_response_code(416);
            exit;
        }

        if ($matches[1] === '') {
            $suffixLength = (int) $matches[2];
            if ($suffixLength <= 0) {
                header("Content-Range: bytes */$fileSize");
                http_response_code(416);
                exit;
            }
            $start = max(0, $fileSize - $suffixLength);
        } else {
            $start = (int) $matches[1];
            if ($matches[2] !== '') {
                $end = (int) $matches[2];
            }
        }

        if ($start >= $fileSize || $end < $start) {
            header("Content-Range: bytes */$fileSize");
            http_response_code(416);
            exit;
        }

        $end = min($end, $fileSize - 1);
        $status = 206;
        header("Content-Range: bytes $start-$end/$fileSize");
    }

    $length = $end - $start + 1;
    $handle = fopen($filePath, 'rb');
    if ($handle === false || fseek($handle, $start) !== 0) {
        if (is_resource($handle)) {
            fclose($handle);
        }
        error_log('Unable to stream eBook for book ID ' . $bookId);
        http_response_code(500);
        exit;
    }

    http_response_code($status);
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: inline; filename="book-' . $bookId . '.' . $fileType . '"');
    header('Accept-Ranges: bytes');
    header('Content-Length: ' . $length);
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: private, no-store, max-age=0');

    $remaining = $length;
    while ($remaining > 0 && !feof($handle)) {
        $chunk = fread($handle, min(8192, $remaining));
        if ($chunk === false || $chunk === '') {
            break;
        }
        echo $chunk;
        $remaining -= strlen($chunk);
    }
    fclose($handle);
} catch (Exception $e) {
    error_log('eBook streaming failed: ' . $e->getMessage());
    http_response_code(500);
}
