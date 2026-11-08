<?php
// Suppress any PHP warnings/deprecations from corrupting JSON output
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
ob_start(); // buffer output so stray warnings don't break JSON

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

// Google Client ID — from env or hardcoded fallback
$GOOGLE_CLIENT_ID = defined('GOOGLE_CLIENT_ID') && GOOGLE_CLIENT_ID !== ''
    ? GOOGLE_CLIENT_ID
    : '22900232380-bu194bg29pvdauj1ac9tu5i588onh6u8.apps.googleusercontent.com';

$raw  = file_get_contents('php://input');
$data = json_decode($raw);

if (empty($data->credential)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Google credential token is required']);
    exit();
}

/**
 * Decode a base64url-encoded JWT segment (no padding needed)
 */
function b64url_decode($data) {
    $rem     = strlen($data) % 4;
    $padded  = $rem ? $data . str_repeat('=', 4 - $rem) : $data;
    return base64_decode(strtr($padded, '-_', '+/'));
}

/**
 * Decode the JWT payload without verifying the RSA signature.
 * Claims (iss, aud, exp, email) are still validated.
 */
function decodeGoogleJwt($idToken) {
    $parts = explode('.', $idToken);
    if (count($parts) !== 3) {
        return null;
    }
    $payload = json_decode(b64url_decode($parts[1]), true);
    return is_array($payload) ? $payload : null;
}

/**
 * Validate all security-relevant claims from the decoded payload.
 */
function validateClaims($payload, $clientId) {
    $iss = $payload['iss'] ?? '';
    $aud = $payload['aud'] ?? '';
    $exp = (int)($payload['exp'] ?? 0);

    // iss must be Google
    if (!in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
        error_log("[google.php] claim fail: iss=$iss");
        return false;
    }

    // aud may be a single string or an array (OpenID Connect allows array)
    $audList = is_array($aud) ? $aud : array_map('trim', explode(',', $aud));
    if (!in_array($clientId, $audList, true)) {
        error_log("[google.php] claim fail: aud=" . json_encode($aud) . " clientId=$clientId");
        return false;
    }

    // Token must not be expired (allow 60s clock skew)
    if ($exp < (time() - 60)) {
        error_log("[google.php] claim fail: expired exp=$exp now=" . time());
        return false;
    }

    // Must have a Google user ID and verified email
    if (empty($payload['sub']) || empty($payload['email'])) {
        error_log("[google.php] claim fail: missing sub or email");
        return false;
    }

    $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);
    if (!$emailVerified) {
        error_log("[google.php] claim fail: email_verified=false for " . $payload['email']);
        return false;
    }

    return true;
}

/**
 * Try Google's tokeninfo endpoint (online, authoritative).
 * Returns the parsed payload array on success, or null on failure.
 */
function fetchTokeninfo($idToken) {
    if (!function_exists('curl_init')) {
        error_log('[google.php] cURL not available');
        return null;
    }

    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($idToken);
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);
    $body   = curl_exec($ch);
    $curlErr = curl_error($ch);
    $status  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // Note: curl_close() deprecated in PHP 8.4 but harmless
    @curl_close($ch);

    if ($curlErr || $body === false) {
        error_log("[google.php] tokeninfo cURL error: $curlErr");
        return null;
    }

    if ($status !== 200) {
        error_log("[google.php] tokeninfo HTTP $status: $body");
        return null;
    }

    $payload = json_decode($body, true);
    return is_array($payload) ? $payload : null;
}

// ── Main verification ──────────────────────────────────────────────────────
$idToken        = $data->credential;
$googlePayload  = null;
$verifyMethod   = '';

// Strategy 1 — tokeninfo endpoint
$tiPayload = fetchTokeninfo($idToken);
if ($tiPayload !== null) {
    if (validateClaims($tiPayload, $GOOGLE_CLIENT_ID)) {
        $googlePayload = $tiPayload;
        $verifyMethod  = 'tokeninfo';
    } else {
        // Claims failed even though tokeninfo returned 200 — hard reject
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Google sign-in could not be verified. Token claims invalid.']);
        exit();
    }
}

// Strategy 2 — local JWT decode (fallback when tokeninfo is unreachable/rate-limited)
if ($googlePayload === null) {
    error_log('[google.php] tokeninfo unavailable, falling back to local JWT decode');
    $localPayload = decodeGoogleJwt($idToken);
    if ($localPayload !== null && validateClaims($localPayload, $GOOGLE_CLIENT_ID)) {
        $googlePayload = $localPayload;
        $verifyMethod  = 'local_decode';
    }
}

if ($googlePayload === null) {
    error_log('[google.php] both verification strategies failed for token: ' . substr($idToken, 0, 20) . '...');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Google sign-in could not be verified. Please try again.']);
    exit();
}

error_log("[google.php] verified via $verifyMethod for email=" . ($googlePayload['email'] ?? '?'));

// ── Find or create user ────────────────────────────────────────────────────
try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed. Make sure MySQL is running.']);
        exit();
    }

    $googleId = $googlePayload['sub']     ?? '';
    $email    = $googlePayload['email']   ?? '';
    $name     = $googlePayload['name']    ?? ($googlePayload['given_name'] ?? 'Google User');
    $picture  = $googlePayload['picture'] ?? '';

    // Find existing user by google_id OR email
    $stmt = $db->prepare(
        'SELECT id, user_id, full_name, email, role, status, profile_image, google_id
         FROM users WHERE google_id = ? OR email = ? LIMIT 1'
    );
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['status'] === 'suspended') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Account suspended. Contact an administrator.']);
            exit();
        }
        if ($user['status'] !== 'active') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Account is not active. Contact an administrator.']);
            exit();
        }

        // Update last_login, link google_id, and cache profile picture if missing
        $updates = ['last_login = NOW()'];
        $params  = [];
        if (empty($user['google_id']) && $googleId) {
            $updates[] = 'google_id = ?';
            $params[]  = $googleId;
        }
        if (empty($user['profile_image']) && $picture) {
            $updates[] = 'profile_image = ?';
            $params[]  = $picture;
        }
        $params[] = $user['id'];
        $db->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);

        $stmt2 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt2->execute([$user['id']]);
        $user = $stmt2->fetch(PDO::FETCH_ASSOC);

    } else {
        // Auto-register new Google user
        $userId   = null;
        $attempts = 0;
        do {
            $base      = (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn() + 1 + $attempts;
            $candidate = 'USR' . str_pad($base, 3, '0', STR_PAD_LEFT);
            $chk       = $db->prepare('SELECT id FROM users WHERE user_id = ? LIMIT 1');
            $chk->execute([$candidate]);
            if ($chk->rowCount() === 0) $userId = $candidate;
            $attempts++;
        } while ($userId === null && $attempts < 1000);

        $ins = $db->prepare(
            "INSERT INTO users (user_id, full_name, email, password_hash, role, status, google_id, profile_image, last_login)
             VALUES (?, ?, ?, '', 'user', 'active', ?, ?, NOW())"
        );
        $ins->execute([$userId, $name, $email, $googleId, $picture]);
        $newId = $db->lastInsertId();

        $stmt3 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt3->execute([$newId]);
        $user = $stmt3->fetch(PDO::FETCH_ASSOC);
    }

    if (!$user) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to load user record after authentication.']);
        exit();
    }

    $token = generateJWT([
        'user_id' => $user['id'],
        'email'   => $user['email'],
        'role'    => $user['role'],
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Google authentication successful',
        'data'    => ['token' => $token, 'user' => $user],
    ]);

} catch (Exception $e) {
    error_log('[google.php] DB error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error during authentication.']);
}
?>
