<?php
/**
 * Application Configuration
 */

function loadApplicationEnvironment($envFile) {
    if (!is_file($envFile)) {
        error_log('Application environment file not found: ' . $envFile);
        return;
    }

    $contents = file_get_contents($envFile);
    if ($contents === false) {
        error_log('Application environment file could not be read: ' . $envFile);
        return;
    }

    if (substr($contents, 0, 2) === "\xFF\xFE") {
        $encoding = 'UTF-16LE';
        $contents = substr($contents, 2);
    } elseif (substr($contents, 0, 2) === "\xFE\xFF") {
        $encoding = 'UTF-16BE';
        $contents = substr($contents, 2);
    } elseif (strpos($contents, "\0") !== false) {
        $evenByteNulls = 0;
        $oddByteNulls = 0;
        for ($index = 0, $length = strlen($contents); $index < $length; $index++) {
            if ($contents[$index] === "\0") {
                if ($index % 2 === 0) {
                    $evenByteNulls++;
                } else {
                    $oddByteNulls++;
                }
            }
        }
        $encoding = $oddByteNulls > $evenByteNulls ? 'UTF-16LE' : 'UTF-16BE';
    }

    if (isset($encoding)) {
        if (!function_exists('iconv')) {
            error_log('Application environment file requires the PHP iconv extension to decode its encoding.');
            return;
        }
        $contents = iconv($encoding, 'UTF-8//IGNORE', $contents);
    }

    if ($contents === false) {
        error_log('Application environment file encoding could not be decoded: ' . $envFile);
        return;
    }

    $contents = preg_replace('/^\xEF\xBB\xBF/', '', $contents);
    foreach (preg_split('/\r\n|\n|\r/', $contents) as $lineNumber => $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        if (!preg_match('/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/', $line, $matches)) {
            error_log('Ignoring malformed application environment entry on line ' . ($lineNumber + 1));
            continue;
        }

        $key = $matches[1];
        $value = trim($matches[2]);
        if (preg_match('/^(["\'])(.*)\1$/', $value, $quotedValue)) {
            $value = $quotedValue[2];
        }

        if (function_exists('putenv')) {
            putenv($key . '=' . $value);
        }
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function getApplicationEnvironment($key, $default = '') {
    if (function_exists('getenv')) {
        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return $value;
        }
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }

    return $default;
}

loadApplicationEnvironment(__DIR__ . '/../.env');

// Error reporting
$appDebug = filter_var(getApplicationEnvironment('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
error_reporting(E_ALL);
ini_set('display_errors', $appDebug ? '1' : '0');
ini_set('log_errors', '1');

// CORS is only needed when the frontend and API are on different origins.
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$configuredOrigins = getApplicationEnvironment('CORS_ALLOWED_ORIGINS', 'http://localhost:3000');
$allowedOrigins = array_filter(array_map('trim', explode(',', $configuredOrigins)));

// Check if origin is allowed (supports wildcards with *)
$originAllowed = false;
if ($requestOrigin !== '') {
    foreach ($allowedOrigins as $allowedOrigin) {
        // Convert wildcard pattern to regex
        if (strpos($allowedOrigin, '*') !== false) {
            $pattern = '/^' . str_replace('\\*', '.*', preg_quote($allowedOrigin, '/')) . '$/';
            if (preg_match($pattern, $requestOrigin)) {
                $originAllowed = true;
                break;
            }
        } elseif ($requestOrigin === $allowedOrigin) {
            $originAllowed = true;
            break;
        }
    }
}

if ($originAllowed) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Range');
header('Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JWT Configuration
$jwtSecret = getApplicationEnvironment('JWT_SECRET');
if ($jwtSecret === '' && $appDebug) {
    $jwtSecret = 'local-development-secret-change-before-deployment';
}
define('JWT_SECRET_KEY', $jwtSecret);
define('JWT_SECRET', $jwtSecret);
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours

// Application Settings
define('APP_NAME', 'Digital Library Management System');
define('APP_VERSION', getApplicationEnvironment('APP_VERSION', '1.0.0'));
define('APP_ENV', $appDebug ? 'development' : 'production');

$appBaseUrl = getApplicationEnvironment('APP_BASE_URL');
if ($appBaseUrl === '' && $appDebug) {
    $appBaseUrl = 'http://localhost:3000';
}
define('APP_BASE_URL', rtrim($appBaseUrl, '/'));

$apiPublicUrl = getApplicationEnvironment('API_PUBLIC_URL');
if ($apiPublicUrl === '') {
    $apiPublicUrl = $appDebug
        ? 'http://localhost:8000'
        : (APP_BASE_URL !== '' ? APP_BASE_URL . '/backend' : '');
}
define('API_PUBLIC_URL', rtrim($apiPublicUrl, '/'));

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', intval(getApplicationEnvironment('MAX_UPLOAD_SIZE', '10485760'))); // 10MB default
define('ALLOWED_FILE_TYPES', ['pdf', 'epub', 'jpg', 'jpeg', 'png']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Email Configuration (SendGrid)
define('SENDGRID_API_KEY', getApplicationEnvironment('SENDGRID_API_KEY'));
define('FROM_EMAIL', getApplicationEnvironment('FROM_EMAIL', 'library@digitallibrary.com'));
define('FROM_NAME', getApplicationEnvironment('FROM_NAME', 'Digital Library'));

// Payment Gateway (Chapa)
define('CHAPA_SECRET_KEY', getApplicationEnvironment('CHAPA_SECRET_KEY'));
define('CHAPA_PUBLIC_KEY', getApplicationEnvironment('CHAPA_PUBLIC_KEY'));
$localApiUrl = $appDebug ? 'http://localhost:8000' : API_PUBLIC_URL;
$localAppUrl = $appDebug ? 'http://localhost:3000' : APP_BASE_URL;
define('CHAPA_CALLBACK_URL', getApplicationEnvironment('CHAPA_CALLBACK_URL', $localApiUrl !== '' ? $localApiUrl . '/api/payments/callback' : ''));
define('CHAPA_RETURN_URL', getApplicationEnvironment('CHAPA_RETURN_URL', $localAppUrl !== '' ? $localAppUrl . '/payment/return' : ''));

// Google OAuth
define('GOOGLE_CLIENT_ID', getApplicationEnvironment('GOOGLE_CLIENT_ID', '22900232380-bu194bg29pvdauj1ac9tu5i588onh6u8.apps.googleusercontent.com'));

// Google Books API
define('GOOGLE_BOOKS_API_KEY', getApplicationEnvironment('GOOGLE_BOOKS_API_KEY'));

// Timezone
date_default_timezone_set('UTC');
?>
