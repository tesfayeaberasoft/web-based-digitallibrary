<?php
/**
 * GET /api/books/{id}/notes
 * PUT /api/books/{id}/notes { "note_content": { ...TipTap JSON document... } }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

$user = requireAuth();
$userId = filter_var($user['user_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$bookId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid user session.']);
    exit;
}

if (!$bookId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid book ID is required.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'PUT'], true)) {
    header('Allow: GET, PUT');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    $bookStmt = $db->prepare("SELECT id FROM books WHERE id = ? AND status = 'active' AND file_path IS NOT NULL AND file_path <> ''");
    $bookStmt->execute([$bookId]);
    if (!$bookStmt->fetchColumn()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Digital book not found.']);
        exit;
    }

    if ($method === 'GET') {
        $stmt = $db->prepare('SELECT note_content, created_at, updated_at FROM notes WHERE user_id = ? AND book_id = ? LIMIT 1');
        $stmt->execute([$userId, $bookId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'note' => $row ? [
                'note_content' => json_decode($row['note_content'], true),
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ] : null,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || strlen($rawBody) > 524288) {
        http_response_code(413);
        echo json_encode(['success' => false, 'message' => 'Note content must be smaller than 512 KB.']);
        exit;
    }

    $payload = json_decode($rawBody, true);
    $document = $payload['note_content'] ?? null;
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($document) || ($document['type'] ?? null) !== 'doc'
        || !isset($document['content']) || !is_array($document['content'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'A valid TipTap document is required.']);
        exit;
    }

    $noteContent = json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($noteContent === false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Note content could not be encoded.']);
        exit;
    }

    $stmt = $db->prepare('
        INSERT INTO notes (user_id, book_id, note_content)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE note_content = VALUES(note_content), updated_at = CURRENT_TIMESTAMP
    ');
    $stmt->execute([$userId, $bookId, $noteContent]);

    $stmt = $db->prepare('SELECT created_at, updated_at FROM notes WHERE user_id = ? AND book_id = ? LIMIT 1');
    $stmt->execute([$userId, $bookId]);
    $timestamps = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'note' => [
            'note_content' => $document,
            'created_at' => $timestamps['created_at'] ?? null,
            'updated_at' => $timestamps['updated_at'] ?? null,
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('Book note request failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'The note could not be saved.']);
}