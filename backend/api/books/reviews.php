<?php
/**
 * GET/POST /api/books/{id}/reviews
 * Reads approved reviews and lets an authenticated user create or update their review.
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

$bookId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$bookId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid book ID.']);
    exit;
}

$user = getCurrentUser();

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    $bookStmt = $db->prepare('SELECT id FROM books WHERE id = ?');
    $bookStmt->execute([$bookId]);
    if (!$bookStmt->fetchColumn()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Book not found.']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Sign in to submit a review.']);
            exit;
        }

        $payload = json_decode(file_get_contents('php://input'), true);
        if (!is_array($payload)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid review data.']);
            exit;
        }

        $rating = filter_var($payload['rating'] ?? null, FILTER_VALIDATE_INT);
        $reviewText = trim((string) ($payload['review_text'] ?? ''));
        if ($rating === false || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5 stars.']);
            exit;
        }
        if (mb_strlen($reviewText) > 2000) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Review text must be 2,000 characters or fewer.']);
            exit;
        }

        $stmt = $db->prepare("
            INSERT INTO book_reviews (user_id, book_id, rating, review_text, status)
            VALUES (?, ?, ?, ?, 'approved')
            ON DUPLICATE KEY UPDATE
                rating = VALUES(rating),
                review_text = VALUES(review_text),
                status = 'approved',
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([(int) $user['user_id'], $bookId, $rating, $reviewText !== '' ? $reviewText : null]);
    } elseif ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        header('Allow: GET, POST');
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
        exit;
    }

    $summaryStmt = $db->prepare("
        SELECT ROUND(COALESCE(AVG(rating), 0), 1) AS average_rating, COUNT(*) AS review_count
        FROM book_reviews
        WHERE book_id = ? AND status = 'approved'
    ");
    $summaryStmt->execute([$bookId]);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    $reviewsStmt = $db->prepare("
        SELECT r.id, r.rating, r.review_text, r.created_at, r.updated_at, u.full_name AS reviewer_name
        FROM book_reviews r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.book_id = ? AND r.status = 'approved'
        ORDER BY r.updated_at DESC
        LIMIT 100
    ");
    $reviewsStmt->execute([$bookId]);

    $myReview = null;
    if ($user) {
        $myReviewStmt = $db->prepare("
            SELECT rating, review_text
            FROM book_reviews
            WHERE user_id = ? AND book_id = ?
        ");
        $myReviewStmt->execute([(int) $user['user_id'], $bookId]);
        $myReview = $myReviewStmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    echo json_encode([
        'success' => true,
        'average_rating' => (float) $summary['average_rating'],
        'review_count' => (int) $summary['review_count'],
        'my_review' => $myReview,
        'reviews' => $reviewsStmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
} catch (Exception $e) {
    error_log('Book reviews request failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Reviews could not be loaded.']);
}
