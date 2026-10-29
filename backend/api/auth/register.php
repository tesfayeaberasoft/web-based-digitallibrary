<?php
/**
 * User Registration Endpoint
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

function registrationError($status, $message, $errors = []) {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors
    ]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    registrationError(400, 'Invalid JSON payload');
}

$fullName = isset($data['full_name']) && is_string($data['full_name'])
    ? trim($data['full_name'])
    : '';
$email = isset($data['email']) && is_string($data['email'])
    ? strtolower(trim($data['email']))
    : '';
$phone = isset($data['phone']) && is_string($data['phone'])
    ? trim($data['phone'])
    : '';
$address = isset($data['address']) && is_string($data['address'])
    ? trim($data['address'])
    : '';
$password = isset($data['password']) && is_string($data['password'])
    ? $data['password']
    : '';

$errors = [];
$nameLength = preg_match_all('/./us', $fullName);
$addressLength = preg_match_all('/./us', $address);
$passwordLength = preg_match_all('/./us', $password);

if ($fullName === '' || $nameLength === false || $nameLength < 3
    || $nameLength > 100 || preg_match('/\A[\p{L}\p{M} ]+\z/u', $fullName) !== 1) {
    $errors['full_name'] = 'Name must be 3 to 100 characters and contain letters and spaces only.';
}

if ($email === '' || strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Enter a valid email address.';
}

$phoneDigits = preg_replace('/[\s()-]/', '', $phone);
if ($phone === '' || strlen($phone) > 20
    || preg_match('/\A(?:\+251|0)?[79][0-9]{8}\z/', $phoneDigits) !== 1) {
    $errors['phone'] = 'Enter a valid Ethiopian mobile number, such as 0912345678 or +251912345678.';
}

if ($address === '' || $addressLength === false || $addressLength < 5) {
    $errors['address'] = 'Address must be at least 5 characters.';
}

if ($passwordLength === false || $passwordLength < 8
    || !preg_match('/[A-Z]/', $password)
    || !preg_match('/[a-z]/', $password)
    || !preg_match('/[0-9]/', $password)
    || !preg_match('/[^A-Za-z0-9]/', $password)) {
    $errors['password'] = 'Password must be at least 8 characters and include uppercase and lowercase letters, a number, and a special character.';
}

if ($errors) {
    registrationError(422, 'Please correct the highlighted fields.', $errors);
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed');
    }

    $checkStmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $checkStmt->execute([':email' => $email]);
    if ($checkStmt->fetchColumn()) {
        registrationError(409, 'Email already registered.', [
            'email' => 'This email address is already registered.'
        ]);
    }

    $userId = null;
    $attempts = 0;
    do {
        $totalStmt = $db->query('SELECT COUNT(*) FROM users');
        $base = (int)$totalStmt->fetchColumn() + 1 + $attempts;
        $candidate = 'USR' . str_pad((string)$base, 3, '0', STR_PAD_LEFT);
        $checkId = $db->prepare('SELECT id FROM users WHERE user_id = ? LIMIT 1');
        $checkId->execute([$candidate]);
        if (!$checkId->fetchColumn()) {
            $userId = $candidate;
        }
        $attempts++;
    } while ($userId === null && $attempts < 1000);

    if ($userId === null) {
        throw new RuntimeException('Unable to allocate a user ID');
    }

    $passwordAlgorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    if ($passwordAlgorithm === PASSWORD_BCRYPT && strlen($password) > 72) {
        registrationError(422, 'Please correct the highlighted fields.', [
            'password' => 'Password must not exceed 72 bytes on this server.'
        ]);
    }
    $passwordHash = password_hash($password, $passwordAlgorithm);
    if ($passwordHash === false) {
        throw new RuntimeException('Password hashing failed');
    }

    $insertStmt = $db->prepare(
        "INSERT INTO users (user_id, full_name, email, phone, address, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, ?, 'user', 'active')"
    );
    $insertStmt->execute([
        $userId,
        $fullName,
        $email,
        $phone,
        $address,
        $passwordHash
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful. Please login.',
        'data' => [
            'user_id' => $userId,
            'email' => $email
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        try {
            $checkStmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
            $checkStmt->execute([':email' => $email]);
            if ($checkStmt->fetchColumn()) {
                registrationError(409, 'Email already registered.', [
                    'email' => 'This email address is already registered.'
                ]);
            }
        } catch (Throwable $checkError) {
            error_log('Registration duplicate check failed: ' . $checkError->getMessage());
        }
    }

    error_log('Registration database error: ' . $e->getMessage());
    registrationError(500, 'An error occurred during registration. Please try again.');
} catch (Throwable $e) {
    error_log('Registration error: ' . $e->getMessage());
    registrationError(500, 'An error occurred during registration. Please try again.');
}
