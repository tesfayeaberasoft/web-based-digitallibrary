<?php
/**
 * Router for PHP Built-in Server
 * This file handles routing for the PHP built-in development server
 */

// Get the requested URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Log all requests for debugging
error_log("Router received: {$_SERVER['REQUEST_METHOD']} $uri");

// Serve static files directly (if they exist and are not API routes)
if ($uri !== '/' && !preg_match('#^/api#', $uri) && file_exists(__DIR__ . $uri)) {
    error_log("Serving static file: $uri");
    return false;
}

// Route all requests through index.php (including API and non-API)
error_log("Routing to index.php: $uri");
require __DIR__ . '/index.php';
exit(0);
?>
