<?php
/**
 * Look up book metadata by ISBN using Google Books.
 * GET /api/books/metadata?isbn=...
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';

    $user = requireAuth();
    if (!in_array($user['role'] ?? '', ['admin', 'librarian'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions.']);
        exit;
    }

    $isbn = preg_replace('/[\s-]+/', '', (string) ($_GET['isbn'] ?? ''));
    if (!preg_match('/^(?:\d{9}[\dX]|\d{13})$/i', $isbn)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Enter a valid 10- or 13-digit ISBN.']);
        exit;
    }

    if (!function_exists('curl_init')) {
        throw new RuntimeException('The PHP cURL extension is required for book metadata lookup.');
    }

    $query = [
        'q' => 'isbn:' . strtoupper($isbn),
        'maxResults' => 5,
        'printType' => 'books',
    ];
    if (defined('GOOGLE_BOOKS_API_KEY') && GOOGLE_BOOKS_API_KEY !== '') {
        $query['key'] = GOOGLE_BOOKS_API_KEY;
    }

    $curl = curl_init('https://www.googleapis.com/books/v1/volumes?' . http_build_query($query));
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'DigitalLibrary/1.0',
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($response === false) {
        error_log('Google Books request failed: ' . $curlError);
        http_response_code(502);
        echo json_encode(['success' => false, 'message' => 'Book metadata service is unavailable. Please try again.']);
        exit;
    }

    if ($status !== 200) {
        error_log('Google Books returned HTTP ' . $status);
        if ($status === 429) {
            http_response_code(503);
            $message = 'Google Books request limit reached. Check the API key quota and try again later.';
        } elseif ($status >= 500) {
            http_response_code(503);
            $message = 'Google Books is temporarily unavailable. Please try again later.';
        } else {
            http_response_code(502);
            $message = 'Google Books rejected the request. Check that the API key is valid and the Books API is enabled.';
        }
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }

    $googleResponse = json_decode($response, true);
    if (!is_array($googleResponse)) {
        throw new RuntimeException('Google Books returned invalid JSON.');
    }

    $book = null;
    foreach ($googleResponse['items'] ?? [] as $item) {
        $volume = $item['volumeInfo'] ?? [];
        foreach ($volume['industryIdentifiers'] ?? [] as $identifier) {
            $resultIsbn = preg_replace('/[\s-]+/', '', (string) ($identifier['identifier'] ?? ''));
            if (strcasecmp($resultIsbn, $isbn) === 0) {
                $book = $volume;
                break 2;
            }
        }
    }

    if (!$book) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No book was found for this ISBN.']);
        exit;
    }

    $images = $book['imageLinks'] ?? [];
    $coverImage = $images['extraLarge']
        ?? $images['large']
        ?? $images['medium']
        ?? $images['thumbnail']
        ?? $images['smallThumbnail']
        ?? null;
    if ($coverImage) {
        $coverImage = str_replace(['http://', '&amp;'], ['https://', '&'], $coverImage);
    }

    $authors = array_values(array_filter($book['authors'] ?? [], 'is_string'));
    $publicationYear = null;
    if (isset($book['publishedDate']) && is_string($book['publishedDate'])
        && preg_match('/^\d{4}/', $book['publishedDate'], $yearMatch)) {
        $publicationYear = $yearMatch[0];
    }

    echo json_encode([
        'success' => true,
        'metadata' => [
            'title' => $book['title'] ?? '',
            'authors' => $authors,
            'author' => implode(', ', $authors),
            'publisher' => $book['publisher'] ?? '',
            'cover_image' => $coverImage,
            'publication_year' => $publicationYear,
            'description' => $book['description'] ?? '',
            'pages' => $book['pageCount'] ?? null,
            'language' => $book['language'] ?? '',
        ],
    ]);
} catch (Exception $e) {
    error_log('Book metadata lookup failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not retrieve book metadata.']);
}
