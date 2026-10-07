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
 * Verify the Google ID token by calling Google's tokeninfo endpoint.
 * Returns the decoded payload or false on failure.
 */
function verifyGoogleToken($idToken) {
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);

    $ctx = stream_context_create([
        'http' => [
            'method'  => 'GET',
            'timeout' => 10,
        ],
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $ctx);

    if ($response === false) {
        // Fallback: try with cURL if file_get_contents fails
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($httpCode !== 200) return false;
        } else {
            return false;
        }
    }

    $payload = json_decode($response, true);

    // Google returns an error field if the token is invalid
    if (isset($payload['error'])) {
        return false;
    }

    // Make sure the token has not expired
    if (isset($payload['exp']) && $payload['exp'] < time()) {
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
        echo json_encode(['success' => false, 'message' => 'Invalid Google token. Please try again.']);
        exit();
    }

    $googleId = $googleUser['sub'];          // Unique Google user ID
    $email    = $googleUser['email'] ?? '';
    $name     = $googleUser['name']  ?? '';
    $picture  = $googleUser['picture'] ?? '';

    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Google account does not have an email address.']);
        exit();
    }

    // -------------------------------------------------------
    // Find existing user by google_id OR email
    // -------------------------------------------------------
    $stmt = $db->prepare(
        "SELECT id, user_id, full_name, email, role, status, profile_image, google_id
         FROM users
         WHERE google_id = ? OR email = ?
         LIMIT 1"
    );
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // -- EXISTING USER --

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

        // Link google_id if not already linked (user registered with email first)
        $updates = [];
        $params  = [];

        if (empty($user['google_id'])) {
            $updates[] = 'google_id = ?';
            $params[]  = $googleId;
        }
        // Update profile picture from Google if the user has none
        if (empty($user['profile_image']) && !empty($picture)) {
            $updates[] = 'profile_image = ?';
            $params[]  = $picture;
        }
        $updates[] = 'last_login = NOW()';

        $params[] = $user['id'];
        $db->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?')
           ->execute($params);

        // Refresh user data
        $stmt2 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt2->execute([$user['id']]);
        $user = $stmt2->fetch(PDO::FETCH_ASSOC);

    } else {
        // -- NEW USER: auto-register --

        // Generate unique user_id
        $userId   = null;
        $attempts = 0;
        do {
            $base      = $db->query('SELECT COUNT(*) FROM users')->fetchColumn() + 1 + $attempts;
            $candidate = 'USR' . str_pad($base, 3, '0', STR_PAD_LEFT);
            $chk       = $db->prepare('SELECT id FROM users WHERE user_id = ? LIMIT 1');
            $chk->execute([$candidate]);
            if ($chk->rowCount() === 0) $userId = $candidate;
            $attempts++;
        } while ($userId === null && $attempts < 1000);

        $insertStmt = $db->prepare(
            "INSERT INTO users
                (user_id, full_name, email, password_hash, role, status, google_id, profile_image, last_login)
             VALUES
                (?, ?, ?, '', 'user', 'active', ?, ?, NOW())"
        );
        $insertStmt->execute([$userId, $name, $email, $googleId, $picture]);

        $newId = $db->lastInsertId();
        $stmt3 = $db->prepare('SELECT id, user_id, full_name, email, role, status, profile_image FROM users WHERE id = ?');
        $stmt3->execute([$newId]);
        $user = $stmt3->fetch(PDO::FETCH_ASSOC);
    }

    // Generate JWT
    $token = generateJWT([
        'user_id' => $user['id'],
        'email'   => $user['email'],
        'role'    => $user['role'],
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Google authentication successful',
        'data'    => [
            'token' => $token,
            'user'  => $user,
        ],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during Google authentication',
        'error'   => $e->getMessage(),
    ]);
}
?>
