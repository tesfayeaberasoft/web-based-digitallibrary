<?php
/**
 * Application Configuration
 */

// Load .env file
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                $value = $matches[2];
            }
            
            // Set in environment
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Range");
header("Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JWT Configuration
define('JWT_SECRET_KEY', getenv('JWT_SECRET') ?: 'your-secret-key-here-change-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours

// Application Settings
define('APP_NAME', 'Digital Library Management System');
define('APP_VERSION', getenv('APP_VERSION') ?: '1.0.0');
define('APP_ENV', getenv('APP_DEBUG') === 'true' ? 'development' : 'production');

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', intval(getenv('MAX_UPLOAD_SIZE') ?: 10485760)); // 10MB default
define('ALLOWED_FILE_TYPES', ['pdf', 'epub', 'jpg', 'jpeg', 'png']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Email Configuration (SendGrid)
define('SENDGRID_API_KEY', getenv('SENDGRID_API_KEY') ?: '');
define('FROM_EMAIL', getenv('FROM_EMAIL') ?: 'library@digitallibrary.com');
define('FROM_NAME', getenv('FROM_NAME') ?: 'Digital Library');

// Payment Gateway (Chapa)
define('CHAPA_SECRET_KEY', getenv('CHAPA_SECRET_KEY') ?: '');
define('CHAPA_PUBLIC_KEY', getenv('CHAPA_PUBLIC_KEY') ?: '');
define('CHAPA_CALLBACK_URL', getenv('CHAPA_CALLBACK_URL') ?: 'http://localhost:8000/api/payments/callback');
define('CHAPA_RETURN_URL', getenv('CHAPA_RETURN_URL') ?: 'http://localhost:3000/payment/return');

// Google OAuth
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '22900232380-bu194bg29pvdauj1ac9tu5i588onh6u8.apps.googleusercontent.com');

// Google Books API
define('GOOGLE_BOOKS_API_KEY', getenv('GOOGLE_BOOKS_API_KEY') ?: '');

// Timezone
date_default_timezone_set('UTC');
?>
