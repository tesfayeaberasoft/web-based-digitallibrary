<?php
/**
 * Look up book metadata by ISBN using Google Books.
 * GET /api/books/metadata?isbn=...
 */

header('Content-Type: application/json');

function fetchOpenLibraryMetadata($isbn)
{
    $query = [
        'bibkeys' => 'ISBN:' . $isbn,
        'format' => 'json',
        'jscmd' => 'data',
    ];
    $curl = curl_init('https://openlibrary.org/api/books?' . http_build_query($query));
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'DigitalLibrary/1.0 (book metadata lookup)',
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($response === false || $status !== 200) {
        error_log('Open Library fallback failed with HTTP ' . $status . ($curlError !== '' ? ': ' . $curlError : ''));
        return null;
    }

    $result = json_decode($response, true);
    $book = $result['ISBN:' . $isbn] ?? null;
    if (!is_array($book)) {
        return null;
    }

    $authors = [];
    foreach ($book['authors'] ?? [] as $author) {
        if (is_string($author['name'] ?? null)) {
            $authors[] = $author['name'];
        }
    }

    $publishers = [];
    foreach ($book['publishers'] ?? [] as $publisher) {
        if (is_string($publisher['name'] ?? null)) {
            $publishers[] = $publisher['name'];
        }
    }

    $publicationYear = null;
    if (is_string($book['publish_date'] ?? null)
        && preg_match('/\b\d{4}\b/', $book['publish_date'], $yearMatch)) {
        $publicationYear = $yearMatch[0];
    }

    $images = $book['cover'] ?? [];
    $coverImage = $images['large'] ?? $images['medium'] ?? $images['small'] ?? null;
    if (is_string($coverImage) && strpos($coverImage, 'https://') !== 0) {
        $coverImage = null;
    }

    return [
        'title' => $book['title'] ?? '',
        'authors' => $authors,
        'author' => implode(', ', $authors),
        'publisher' => implode(', ', $publishers),
        'cover_image' => $coverImage,
        'publication_year' => $publicationYear,
        'description' => '',
        'pages' => $book['number_of_pages'] ?? null,
        'language' => '',
    ];
}

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

    $url = 'https://www.googleapis.com/books/v1/volumes?' . http_build_query($query);
    $response = false;
    $status = 0;
    $curlError = '';
    for ($attempt = 1; $attempt <= 3; $attempt++) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT => 'DigitalLibrary/1.0',
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        $transientFailure = $response === false || in_array($status, [500, 502, 503, 504], true);
        if (!$transientFailure || $attempt === 3) {
            break;
        }

        usleep(250000 * $attempt);
    }

    $googleUnavailable = $response === false || $status === 429 || in_array($status, [500, 502, 503, 504], true);
    if ($googleUnavailable) {
        if ($response === false) {
            error_log('Google Books request failed: ' . $curlError);
        } else {
            error_log('Google Books returned HTTP ' . $status);
        }

        $fallbackMetadata = fetchOpenLibraryMetadata($isbn);
        if ($fallbackMetadata !== null) {
            echo json_encode([
                'success' => true,
                'source' => 'open_library',
                'metadata' => $fallbackMetadata,
            ]);
            exit;
        }

        if ($response === false) {
            http_response_code(502);
            echo json_encode(['success' => false, 'message' => 'Google Books is unreachable and the backup metadata service could not find this ISBN. Please try again later.']);
            exit;
        }

        error_log('Google Books returned HTTP ' . $status);
        if ($status === 429) {
            http_response_code(503);
            $message = 'Google Books request limit reached, and the backup metadata service could not find this ISBN. Check the API key quota and try again later.';
        } else {
            http_response_code(503);
            $message = 'Google Books is unavailable, and the backup metadata service could not find this ISBN. Please wait and try again.';
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
        $fallbackMetadata = fetchOpenLibraryMetadata($isbn);
        if ($fallbackMetadata !== null) {
            echo json_encode([
                'success' => true,
                'source' => 'open_library',
                'metadata' => $fallbackMetadata,
            ]);
            exit;
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No book was found for this ISBN in Google Books or the backup metadata service.']);
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
        'source' => 'google_books',
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
