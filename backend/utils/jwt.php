<?php
/**
 * JWT Utility Functions
 * Simple JWT implementation for authentication
 */
require_once __DIR__ . '/../config/config.php';

if (!defined('JWT_ALGORITHM')) {
    define('JWT_ALGORITHM', 'HS256');
}

function jwtSecretIsConfigured() {
    if (!defined('JWT_SECRET') || JWT_SECRET === '') {
        return false;
    }

    if (defined('APP_ENV') && APP_ENV === 'development') {
        return true;
    }

    return strlen(JWT_SECRET) >= 32
        && strpos(JWT_SECRET, 'your-') !== 0
        && strpos(JWT_SECRET, 'change-me') === false;
}

/**
 * Generate JWT Token
 */
function generateJWT($payload) {
    if (!jwtSecretIsConfigured()) {
        throw new RuntimeException('JWT authentication is not configured securely.');
    }

    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    $payload = json_encode($payload);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

/**
 * Verify JWT Token
 */
function verifyJWT($token) {
    if (!jwtSecretIsConfigured()) {
        return false;
    }

    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }
    
    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    
    $signature = base64url_decode($signatureEncoded);
    if ($signature === false) {
        return false;
    }

    $expectedSignature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    $payloadJson = base64url_decode($payloadEncoded);
    if ($payloadJson === false) {
        return false;
    }

    $payload = json_decode($payloadJson, true);
    
    if (!is_array($payload) || !isset($payload['exp']) || (int)$payload['exp'] <= time()) {
        return false;
    }
    
    return $payload;
}

/**
 * Require Authentication - Use this in protected endpoints
 */
function requireAuth() {
    if (!jwtSecretIsConfigured()) {
        http_response_code(503);
        echo json_encode(['success' => false, 'message' => 'Authentication is not configured.']);
        exit;
    }

    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($authHeader === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $authHeader = $value;
                break;
            }
        }
    }

    if ($authHeader === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $authHeader = $value;
                break;
            }
        }
    }

    if ($authHeader === '') {
        foreach ($_SERVER as $key => $value) {
            if (strcasecmp($key, 'HTTP_AUTHORIZATION') === 0
                || strcasecmp($key, 'REDIRECT_HTTP_AUTHORIZATION') === 0
            ) {
                $authHeader = $value;
                break;
            }
        }
    }
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization token required']);
        exit;
    }
    
    $token = $matches[1];
    $decoded = verifyJWT($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
    
    return $decoded;
}

/**
 * Base64 URL Encode
 */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL Decode
 */
function base64url_decode($data) {
    if (!is_string($data) || strlen($data) % 4 === 1) {
        return false;
    }

    $padded = str_pad(strtr($data, '-_', '+/'), strlen($data) + (4 - strlen($data) % 4) % 4, '=', STR_PAD_RIGHT);
    return base64_decode($padded, true);
}

/**
 * Get current user from token (optional auth)
 */
function getCurrentUser() {
    if (!jwtSecretIsConfigured()) {
        return null;
    }
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($authHeader === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $authHeader = $value;
                break;
            }
        }
    }

    if ($authHeader === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $authHeader = $value;
                break;
            }
        }
    }

    if ($authHeader === '') {
        foreach ($_SERVER as $key => $value) {
            if (strcasecmp($key, 'HTTP_AUTHORIZATION') === 0
                || strcasecmp($key, 'REDIRECT_HTTP_AUTHORIZATION') === 0
            ) {
                $authHeader = $value;
                break;
            }
        }
    }
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}

/**
 * Require specific role(s) - Use this in role-protected endpoints
 */
function requireRole($allowedRoles) {
    $decoded = requireAuth();
    
    // Normalize to array
    if (!is_array($allowedRoles)) {
        $allowedRoles = [$allowedRoles];
    }
    
    // Check if user's role is in allowed roles
    if (!in_array($decoded['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient permissions. Required role: ' . implode(' or ', $allowedRoles)
        ]);
        exit;
    }
    
    return $decoded;
}
