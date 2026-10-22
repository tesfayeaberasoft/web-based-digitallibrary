<?php
/**
 * GET /api/favorites
 * POST /api/favorites { "book_id": 123 }
 * DELETE /api/favorites/{bookId}
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

$user = requireAuth();
$userId = (int) ($user['user_id'] ?? 0);
if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid user session.']);
    exit;
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->prepare("
            SELECT b.id, b.title, b.author, b.isbn, b.category_id, b.description,
                   b.cover_image, b.total_copies, b.available_copies, b.file_type,
                   b.status, c.name AS category_name, c.color_code AS category_color,
                   (SELECT ROUND(COALESCE(AVG(r.rating), 0), 1)
                    FROM book_reviews r
                    WHERE r.book_id = b.id AND r.status = 'approved') AS avg_rating,
                   (SELECT COUNT(*)
                    FROM book_reviews r
                    WHERE r.book_id = b.id AND r.status = 'approved') AS review_count,
                   CASE WHEN b.file_path IS NOT NULL AND b.file_path != '' THEN 1 ELSE 0 END AS has_digital_content,
                   uf.created_at AS favorited_at
            FROM user_favorites uf
            INNER JOIN books b ON b.id = uf.book_id
            LEFT JOIN categories c ON c.id = b.category_id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC
        ");
        $stmt->execute([$userId]);
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($books as &$book) {
            $book['avg_rating'] = (float) $book['avg_rating'];
            $book['review_count'] = (int) $book['review_count'];
            $book['has_digital_content'] = (bool) $book['has_digital_content'];
            $book['can_read_online'] = $book['has_digital_content'] && $book['status'] === 'active';
        }
        unset($book);

        echo json_encode(['success' => true, 'favorites' => $books]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = json_decode(file_get_contents('php://input'), true);
        $bookId = filter_var($payload['book_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$bookId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'A valid book ID is required.']);
            exit;
        }

        $bookStmt = $db->prepare('SELECT id FROM books WHERE id = ?');
        $bookStmt->execute([$bookId]);
        if (!$bookStmt->fetchColumn()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Book not found.']);
            exit;
        }

        $stmt = $db->prepare('INSERT IGNORE INTO user_favorites (user_id, book_id) VALUES (?, ?)');
        $stmt->execute([$userId, $bookId]);
        echo json_encode(['success' => true, 'is_favorite' => true]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $bookId = filter_var($_GET['book_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$bookId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'A valid book ID is required.']);
            exit;
        }

        $stmt = $db->prepare('DELETE FROM user_favorites WHERE user_id = ? AND book_id = ?');
        $stmt->execute([$userId, $bookId]);
        echo json_encode(['success' => true, 'is_favorite' => false]);
        exit;
    }

    header('Allow: GET, POST, DELETE');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
} catch (Exception $e) {
    error_log('Favorites request failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Favorites could not be loaded.']);
}
