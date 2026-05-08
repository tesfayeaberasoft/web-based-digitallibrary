<?php
/**
 * Application Configuration
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JWT Configuration
define('JWT_SECRET_KEY', 'your-secret-key-here-change-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours

// Application Settings
define('APP_NAME', 'Digital Library Management System');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development, production

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10485760); // 10MB
define('ALLOWED_FILE_TYPES', ['pdf', 'epub', 'jpg', 'jpeg', 'png']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Email Configuration (SendGrid)
define('SENDGRID_API_KEY', 'your-sendgrid-api-key');
define('FROM_EMAIL', 'library@digitallibrary.com');
define('FROM_NAME', 'Digital Library');

// Payment Gateway (Chapa)
define('CHAPA_SECRET_KEY', 'your-chapa-secret-key');
define('CHAPA_PUBLIC_KEY', 'your-chapa-public-key');
define('CHAPA_CALLBACK_URL', 'http://localhost:8000/api/payments/callback');

// Google Books API
define('GOOGLE_BOOKS_API_KEY', 'your-google-books-api-key');

// Timezone
date_default_timezone_set('UTC');
?>