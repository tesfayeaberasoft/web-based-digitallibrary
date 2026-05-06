<?php
/**
 * Main Entry Point for Digital Library Management System API
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Handle CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Simple router
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api prefix if present
if (strpos($path, '/api') === 0) {
    $path = substr($path, 4);
}

// Ensure path starts with /
if ($path === '' || $path[0] !== '/') {
    $path = '/' . $path;
}

// Log for debugging (remove in production)
error_log("Request: $request_method $path");

// Route handling
switch (true) {
    // Auth routes
    case preg_match('#^/auth/login$#', $path) && $request_method === 'POST':
        error_log("Matched: POST /auth/login");
        require __DIR__ . '/api/auth/login.php';
        break;
    
    case preg_match('#^/auth/register$#', $path) && $request_method === 'POST':
        error_log("Matched: POST /auth/register");
        require __DIR__ . '/api/auth/register.php';
        break;
    
    case preg_match('#^/auth/verify$#', $path) && $request_method === 'GET':
        error_log("Matched: GET /auth/verify");
        require __DIR__ . '/api/auth/verify.php';
        break;
    
    // Users routes
    case preg_match('#^/users$#', $path) && $request_method === 'GET':
        error_log("Matched: GET /users");
        require __DIR__ . '/api/users/list.php';
        break;
    
    case preg_match('#^/users/(\d+)$#', $path, $matches) && $request_method === 'GET':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/get.php';
        break;
    
    case preg_match('#^/users/(\d+)$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/update.php';
        break;
    
    case preg_match('#^/users/(\d+)/password$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/update-password.php';
        break;
    
    case preg_match('#^/users/(\d+)/stats$#', $path, $matches) && $request_method === 'GET':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/stats.php';
        break;
    
    // Librarian stats route
    case preg_match('#^/librarian/stats$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/librarian/stats.php';
        break;
    
    case preg_match('#^/users/(\d+)/profile-image$#', $path, $matches) && $request_method === 'POST':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/upload-profile-image.php';
        break;
    
    // Books routes
    case preg_match('#^/books$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/books/list.php';
        break;
    
    case preg_match('#^/books$#', $path) && $request_method === 'POST':
        require __DIR__ . '/api/books/create.php';
        break;
    
    case preg_match('#^/books/(\d+)$#', $path, $matches) && $request_method === 'GET':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/books/get.php';
        break;
    
    case preg_match('#^/books/(\d+)$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/books/update.php';
        break;
    
    case preg_match('#^/books/(\d+)$#', $path, $matches) && $request_method === 'DELETE':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/books/delete.php';
        break;
    
    // Loans routes
    case preg_match('#^/loans$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/loans/list.php';
        break;
    
    case preg_match('#^/loans$#', $path) && $request_method === 'POST':
        require __DIR__ . '/api/loans/create.php';
        break;
    
    case preg_match('#^/loans/(\d+)/return$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/loans/return.php';
        break;
    
    case preg_match('#^/loans/(\d+)/renew$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/loans/renew.php';
        break;
    
    // Reservations routes
    case preg_match('#^/reservations$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/reservations/list.php';
        break;
    
    case preg_match('#^/reservations$#', $path) && $request_method === 'POST':
        require __DIR__ . '/api/reservations/create.php';
        break;
    
    // Categories routes
    case preg_match('#^/categories$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/categories/list.php';
        break;
    
    // Fines routes
    case preg_match('#^/fines$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/fines/list.php';
        break;
    
    case preg_match('#^/fines/(\d+)/pay$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/fines/pay.php';
        break;
    
    // Notifications routes
    case preg_match('#^/notifications$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/notifications/list.php';
        break;
    
    case preg_match('#^/notifications/(\d+)/read$#', $path, $matches) && $request_method === 'PUT':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/notifications/mark-read.php';
        break;
    
    case preg_match('#^/notifications/mark-all-read$#', $path) && $request_method === 'PUT':
        require __DIR__ . '/api/notifications/mark-all-read.php';
        break;
    
    // Default - API info
    case $path === '/' || $path === '':
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Digital Library Management System API',
            'version' => APP_VERSION,
            'endpoints' => [
                'auth' => '/api/auth/*',
                'users' => '/api/users/*',
                'books' => '/api/books/*',
                'loans' => '/api/loans/*',
                'reservations' => '/api/reservations/*'
            ]
        ]);
        break;
    
    default:
        header('HTTP/1.1 404 Not Found');
        header('Content-Type: application/json');
        error_log("404 Not Found: $request_method $path");
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found',
            'debug' => [
                'path' => $path,
                'method' => $request_method,
                'uri' => $request_uri
            ]
        ]);
        break;
}
?>