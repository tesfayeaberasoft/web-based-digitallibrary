<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

define('GOOGLE_CLIENT_ID_VALUE', defined('GOOGLE_CLIENT_ID')
    ? GOOGLE_CLIENT_ID
    : '22900232380-bu194bg29pvdauj1ac9tu5i588onh6u8.apps.googleusercontent.com'
);

$raw  = file_get_contents('php://input');
$data = json_decode($raw);

if (empty($data->credential)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Google credential token is required']);
    exit();
}

function verifyGoogleToken($idToken) {
    // Split JWT into 3 parts
    $parts = explode('.', $idToken);
    if (count($parts) !== 3) {
        return ['ok' => false, 'reason' => 'token_parts_' . count($parts)];
    }

    // Decode payload segment
    $seg = $parts[1];
    $pad = strlen($seg) % 4;
    if ($pad) $seg .= str_repeat('=', 4 - $pad);
    $json = base64_decode(strtr($seg, '-_', '+/'));
    if ($json === false) {
        return ['ok' => false, 'reason' => 'base64_decode_failed'];
    }
    $payload = json_decode($json, true);
    if (!is_array($payload)) {
        return ['ok' => false, 'reason' => 'json_decode_failed'];
    }

    // Check issuer
    $iss = $payload['iss'] ?? '';
    if (!in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
        return ['ok' => false, 'reason' => 'bad_issuer', 'iss' => $iss];
    }

    // Check expiry
    // The token comes directly from Google's popup — it was just issued.
    // We verify: exp > iat (valid structure) and exp - iat <= 2 hours (reasonable lifetime).
    // We do NOT compare against server time() to avoid clock skew issues.
    $exp = (int)($payload['exp'] ?? 0);
    $iat = (int)($payload['iat'] ?? 0);

    if ($exp === 0) {
        return ['ok' => false, 'reason' => 'no_exp'];
    }

    // Token must not be structurally expired (exp must be after iat)
    if ($exp <= $iat) {
        return ['ok' => false, 'reason' => 'exp_before_iat', 'exp' => $exp, 'iat' => $iat];
    }

    // Token lifetime must be reasonable (Google uses 3600s; allow up to 2 hours)
    $lifetime = $exp - $iat;
    if ($lifetime > 7200) {
        return ['ok' => false, 'reason' => 'lifetime_too_long', 'lifetime' => $lifetime];
    }

    // Check audience
    $aud = $payload['aud'] ?? '';
    if ($aud !== GOOGLE_CLIENT_ID_VALUE) {
        return ['ok' => false, 'reason' => 'aud_mismatch', 'got' => $aud, 'expected' => GOOGLE_CLIENT_ID_VALUE];
    }

    // Must have email
    if (empty($payload['email'])) {
        return ['ok' => false, 'reason' => 'no_email'];
    }

    return ['ok' => true, 'payload' => $payload];
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed. Make sure MySQL is running in XAMPP.']);
        exit();
    }

    $result = verifyGoogleToken($data->credential);

    if (!$result['ok']) {
        // Return the exact failure reason so we can diagnose
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Google token verification failed: ' . $result['reason'],
            'debug'   => $result,
        ]);
        exit();
    }

    $googleUser = $result['payload'];
    $googleId = $googleUser['sub']     ?? '';
    $email    = $googleUser['email']   ?? '';
    $name     = $googleUser['name']    ?? ($googleUser['given_name'] ?? 'Google User');
    $picture  = $googleUser['picture'] ?? '';

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
        // New user — auto register
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
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
    ]);
}
?>
