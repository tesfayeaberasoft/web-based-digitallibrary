<?php
/**
 * Router for PHP Built-in Server
 * This file handles routing for the PHP built-in development server
 */

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit(0);
}

// Get the requested URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route all API requests through index.php
if (strpos($uri, '/api') === 0) {
    require __DIR__ . '/index.php';
    exit(0);
}

// Default route
require __DIR__ . '/index.php';
?>
