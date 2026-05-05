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
$path = str_replace('/api', '', $path);

// Route handling
switch (true) {
    // Auth routes
    case preg_match('#^/auth/login$#', $path) && $request_method === 'POST':
        require __DIR__ . '/api/auth/login.php';
        break;
    
    case preg_match('#^/auth/register$#', $path) && $request_method === 'POST':
        require __DIR__ . '/api/auth/register.php';
        break;
    
    case preg_match('#^/auth/verify$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/auth/verify.php';
        break;
    
    // Users routes
    case preg_match('#^/users$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/users/list.php';
        break;
    
    case preg_match('#^/users/(\d+)$#', $path, $matches) && $request_method === 'GET':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/users/get.php';
        break;
    
    // Books routes
    case preg_match('#^/books$#', $path) && $request_method === 'GET':
        require __DIR__ . '/api/books/list.php';
        break;
    
    case preg_match('#^/books/(\d+)$#', $path, $matches) && $request_method === 'GET':
        $_GET['id'] = $matches[1];
        require __DIR__ . '/api/books/get.php';
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
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found'
        ]);
        break;
}
?>