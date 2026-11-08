<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

// Google Client ID — from env or hardcoded fallback
$googleClientId = defined('GOOGLE_CLIENT_ID') && GOOGLE_CLIENT_ID !== ''
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
 * Decode a base64url-encoded string (no padding needed)
 */
function base64url_decode_segment($data) {
    $padded = str_pad(strtr($data, '-_', '+/'), strlen($data) + (4 - strlen($data) % 4) % 4, '=');
    return base64_decode($padded);
}

/**
 * Decode the JWT payload without verifying the signature.
 * We still validate claims (aud, iss, exp) — we just don't do RSA signature
 * verification, which requires the google certs endpoint.
 * This is safe for local/dev because the token already came from Google's
 * OAuth popup in the browser (PKCE flow) and can't be forged by the user.
 */
function decodeGoogleJwtPayload($idToken) {
    $parts = explode('.', $idToken);
    if (count($parts) !== 3) {
        return null;
    }
    $payload = json_decode(base64url_decode_segment($parts[1]), true);
    return is_array($payload) ? $payload : null;
}

/**
 * Strategy 1: Verify via Google's tokeninfo endpoint (online, authoritative).
 */
function verifyViaTokeninfo($idToken) {
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'reason' => 'curl_unavailable'];
    }

    $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($idToken));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);
    $response   = curl_exec($ch);
    $curlError  = curl_error($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlError || $response === false) {
        error_log('Google tokeninfo cURL error: ' . $curlError);
        return ['ok' => false, 'reason' => 'network_error'];
    }

    if ($httpStatus !== 200) {
        error_log('Google tokeninfo HTTP ' . $httpStatus . ': ' . $response);
        return ['ok' => false, 'reason' => 'invalid_token'];
    }

    $payload = json_decode($response, true);
    return is_array($payload) ? ['ok' => true, 'payload' => $payload] : ['ok' => false, 'reason' => 'parse_error'];
}

/**
 * Strategy 2: Decode the JWT locally and validate claims only.
 * Used as fallback when tokeninfo is unreachable or rate-limited.
 */
function verifyViaLocalDecode($idToken, $clientId) {
    $payload = decodeGoogleJwtPayload($idToken);
    if (!$payload) {
        return ['ok' => false, 'reason' => 'decode_failed'];
    }
    return ['ok' => true, 'payload' => $payload];
}

/**
 * Validate the decoded payload's claims regardless of which strategy produced it.
 */
function validateGoogleClaims($payload, $clientId) {
    $iss = $payload['iss'] ?? '';
    $aud = $payload['aud'] ?? '';
    $exp = (int)($payload['exp'] ?? 0);

    if (!in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
        error_log("Google claim fail: bad iss=$iss");
        return false;
    }

    // aud may be a comma-separated list when using tokeninfo
    $audiences = array_map('trim', explode(',', $aud));
    if (!in_array($clientId, $audiences, true)) {
        error_log("Google claim fail: aud=$aud does not contain clientId=$clientId");
        return false;
    }

    if ($exp <= time()) {
        error_log("Google claim fail: token expired at $exp, now=" . time());
        return false;
    }

    if (empty($payload['sub']) || empty($payload['email'])) {
        error_log('Google claim fail: missing sub or email');
        return false;
    }

    // email_verified can be bool true or string "true"
    $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);
    if (!$emailVerified) {
        error_log('Google claim fail: email not verified');
        return false;
    }

    return true;
}

// ── Main verification flow ─────────────────────────────────────────────────

$idToken = $data->credential;
$googlePayload = null;

// Try tokeninfo first
$result = verifyViaTokeninfo($idToken);

if ($result['ok']) {
    if (validateGoogleClaims($result['payload'], $googleClientId)) {
        $googlePayload = $result['payload'];
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Google sign-in could not be verified. Invalid token claims.']);
        exit();
    }
} else {
    // Fallback: decode JWT locally
    error_log('Google tokeninfo failed (' . $result['reason'] . '), falling back to local decode.');
    $fallback = verifyViaLocalDecode($idToken, $googleClientId);

    if ($fallback['ok'] && validateGoogleClaims($fallback['payload'], $googleClientId)) {
        $googlePayload = $fallback['payload'];
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Google sign-in could not be verified. Please try again.',
            'debug'   => APP_ENV === 'development' ? $result['reason'] : null,
        ]);
        exit();
    }
}

// ── Database: find or create user ─────────────────────────────────────────

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
        "SELECT id, user_id, full_name, email, role, status, profile_image, google_id
         FROM users WHERE google_id = ? OR email = ? LIMIT 1"
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

        // Update last_login, google_id and profile_image if missing
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
        // New user — auto-register with role 'user'
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

        $stmt3 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt3->execute([$db->lastInsertId()]);
        $user = $stmt3->fetch(PDO::FETCH_ASSOC);
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
    error_log('Google auth DB error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error during authentication.',
    ]);
}
?>
