<?php
/**
 * Google OAuth Authentication Endpoint
 * Receives a Google ID token from the frontend, verifies it with Google,
 * then finds or creates the user and returns a JWT.
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

$data = json_decode(file_get_contents('php://input'));

if (empty($data->credential)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Google credential token is required']);
    exit();
}

/**
 * Decode a JWT segment (base64url decode + JSON parse)
 */
function decodeJwtSegment($segment) {
    $padding = strlen($segment) % 4;
    if ($padding) {
        $segment .= str_repeat('=', 4 - $padding);
    }
    return json_decode(base64_decode(strtr($segment, '-_', '+/')), true);
}

/**
 * Verify the Google ID token using cURL against Google's tokeninfo endpoint.
 * Returns the decoded payload array on success, or false on failure.
 */
function verifyGoogleToken($idToken) {
    if (!function_exists('curl_init')) {
        error_log('google.php: cURL is not available');
        return false;
    }

    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        CURLOPT_USERAGENT      => 'DigitalLibrary/1.0',
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("google.php: cURL error: $curlError");
        // SSL issue — retry without peer verification (dev only)
        $ch2 = curl_init($url);
        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_USERAGENT      => 'DigitalLibrary/1.0',
        ]);
        $response = curl_exec($ch2);
        $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch2);
        curl_close($ch2);

        if ($curlError || $httpCode !== 200) {
            error_log("google.php: retry cURL also failed: $curlError, HTTP $httpCode");
            return false;
        }
    }

    if ($httpCode !== 200) {
        error_log("google.php: Google returned HTTP $httpCode: $response");
        return false;
    }

    $payload = json_decode($response, true);

    if (!$payload || isset($payload['error'])) {
        error_log("google.php: Google token error: " . ($payload['error_description'] ?? 'unknown'));
        return false;
    }

    // Token must not be expired
    if (isset($payload['exp']) && (int)$payload['exp'] < time()) {
        error_log("google.php: Token expired");
        return false;
    }

    // Token must have an email
    if (empty($payload['email'])) {
        error_log("google.php: Token missing email");
        return false;
    }

    return $payload;
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) throw new Exception('Database connection failed');

    // Verify token with Google
    $googleUser = verifyGoogleToken($data->credential);

    if (!$googleUser) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Could not verify your Google account. Please try again.',
        ]);
        exit();
    }

    $googleId = $googleUser['sub']          ?? '';
    $email    = $googleUser['email']        ?? '';
    $name     = $googleUser['name']         ?? $googleUser['given_name'] ?? 'Google User';
    $picture  = $googleUser['picture']      ?? '';

    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Google account does not have an email address.']);
        exit();
    }

    // ---------------------------------------------------
    // Find existing user by google_id OR email
    // ---------------------------------------------------
    $stmt = $db->prepare(
        "SELECT id, user_id, full_name, email, role, status, profile_image, google_id
         FROM users
         WHERE google_id = ? OR email = ?
         LIMIT 1"
    );
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // --- EXISTING USER ---
        if ($user['status'] === 'suspended') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Your account is suspended. Contact an administrator.']);
            exit();
        }
        if ($user['status'] !== 'active') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Your account is not active. Contact an administrator.']);
            exit();
        }

        // Build update fields
        $updates = ['last_login = NOW()'];
        $params  = [];

        if (empty($user['google_id'])) {
            $updates[] = 'google_id = ?';
            $params[]  = $googleId;
        }
        if (empty($user['profile_image']) && !empty($picture)) {
            $updates[] = 'profile_image = ?';
            $params[]  = $picture;
        }
        $params[] = $user['id'];
        $db->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?')
           ->execute($params);

        // Refresh
        $stmt2 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt2->execute([$user['id']]);
        $user = $stmt2->fetch(PDO::FETCH_ASSOC);

    } else {
        // --- NEW USER: auto-register ---
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
            "INSERT INTO users
                (user_id, full_name, email, password_hash, role, status, google_id, profile_image, last_login)
             VALUES (?, ?, ?, '', 'user', 'active', ?, ?, NOW())"
        );
        $ins->execute([$userId, $name, $email, $googleId, $picture]);

        $stmt3 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt3->execute([$db->lastInsertId()]);
        $user = $stmt3->fetch(PDO::FETCH_ASSOC);
    }

    // Issue JWT
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
    error_log("google.php exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during Google authentication.',
        'error'   => $e->getMessage(),
    ]);
}
?>
