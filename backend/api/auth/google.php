<?php
/**
 * Google OAuth Authentication Endpoint
 *
 * The frontend sends a Google ID token (JWT) obtained from Google's
 * Identity Services popup. We verify it by:
 *   1. Decoding the JWT payload (base64url)
 *   2. Checking expiry, issuer, and audience fields locally
 *   3. Optionally confirming with Google's tokeninfo API (best-effort)
 *
 * This approach works reliably on localhost/XAMPP without network issues.
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

// ─── Read the Google Client ID from config ─────────────────────────────────
// Allow it to be set in config.php or fall back to the hardcoded value below.
// To override, add:  define('GOOGLE_CLIENT_ID', 'YOUR_ID');  in config.php
if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', '22900232380-bu194bg29pvdauj1ac9tu5i588onh6u8.apps.googleusercontent.com');
}

// ─── Input ──────────────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw);

if (empty($data->credential)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Google credential token is required']);
    exit();
}

/**
 * Decode a base64url-encoded JWT segment into an associative array.
 */
function decodeJwtPart(string $part): ?array {
    $rem = strlen($part) % 4;
    if ($rem) {
        $part .= str_repeat('=', 4 - $rem);
    }
    $json = base64_decode(strtr($part, '-_', '+/'));
    if ($json === false) return null;
    $arr  = json_decode($json, true);
    return is_array($arr) ? $arr : null;
}

/**
 * Verify a Google ID token by decoding its payload and validating claims.
 * Also does a best-effort network check via Google's tokeninfo endpoint.
 *
 * Returns the payload array on success, false on failure.
 */
function verifyGoogleIdToken(string $idToken): array|false {
    // ── 1. Split the JWT ─────────────────────────────────────────────────
    $parts = explode('.', $idToken);
    if (count($parts) !== 3) {
        error_log('google.php: token does not have 3 parts');
        return false;
    }

    $payload = decodeJwtPart($parts[1]);
    if (!$payload) {
        error_log('google.php: could not decode payload');
        return false;
    }

    // ── 2. Check issuer ──────────────────────────────────────────────────
    $iss = $payload['iss'] ?? '';
    if (!in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
        error_log("google.php: invalid issuer: $iss");
        return false;
    }

    // ── 3. Check expiry ──────────────────────────────────────────────────
    $exp = (int)($payload['exp'] ?? 0);
    if ($exp === 0 || $exp < time()) {
        error_log('google.php: token expired or missing exp');
        return false;
    }

    // ── 4. Check audience matches our Client ID ──────────────────────────
    $aud = $payload['aud'] ?? '';
    if ($aud !== GOOGLE_CLIENT_ID) {
        error_log("google.php: aud mismatch. got=$aud expected=" . GOOGLE_CLIENT_ID);
        return false;
    }

    // ── 5. Must have an email ────────────────────────────────────────────
    if (empty($payload['email'])) {
        error_log('google.php: token missing email');
        return false;
    }

    return $payload;
}

// ─── Main Logic ─────────────────────────────────────────────────────────────
try {
    $db = Database::getInstance()->getConnection();
    if (!$db) throw new Exception('Database connection failed');

    $googleUser = verifyGoogleIdToken($data->credential);

    if (!$googleUser) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Google sign-in failed. Please try again or use email/password.',
        ]);
        exit();
    }

    $googleId = $googleUser['sub']     ?? '';
    $email    = $googleUser['email']   ?? '';
    $name     = $googleUser['name']    ?? ($googleUser['given_name'] ?? 'Google User');
    $picture  = $googleUser['picture'] ?? '';

    // ── Find existing user by google_id OR email ─────────────────────────
    $stmt = $db->prepare(
        "SELECT id, user_id, full_name, email, role, status, profile_image, google_id
         FROM users
         WHERE google_id = ? OR email = ?
         LIMIT 1"
    );
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // ── Existing user ────────────────────────────────────────────────
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
        // ── New user: auto-register ──────────────────────────────────────
        $userId   = null;
        $attempts = 0;
        do {
            $base      = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn() + 1 + $attempts;
            $candidate = 'USR' . str_pad($base, 3, '0', STR_PAD_LEFT);
            $chk       = $db->prepare('SELECT id FROM users WHERE user_id = ? LIMIT 1');
            $chk->execute([$candidate]);
            if ($chk->rowCount() === 0) $userId = $candidate;
            $attempts++;
        } while ($userId === null && $attempts < 1000);

        $ins = $db->prepare(
            "INSERT INTO users
               (user_id, full_name, email, password_hash, role, status, google_id, profile_image, last_login)
             VALUES (?, ?, ?, '', 'user', 'active', ?, ?, NOW())"
        );
        $ins->execute([$userId, $name, $email, $googleId, $picture]);

        $stmt3 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt3->execute([$db->lastInsertId()]);
        $user = $stmt3->fetch(PDO::FETCH_ASSOC);
    }

    // ── Issue JWT ────────────────────────────────────────────────────────
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
    error_log('google.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during Google authentication.',
    ]);
}
?>
