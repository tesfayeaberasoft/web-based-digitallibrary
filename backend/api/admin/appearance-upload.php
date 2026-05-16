<?php
/**
 * Upload library logo or favicon for appearance settings.
 */
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();

    if (!in_array($decoded['role'], ['admin', 'super-admin'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
        exit;
    }

    $type = $_POST['type'] ?? 'logo';
    if (!in_array($type, ['logo', 'favicon'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid type. Use logo or favicon.']);
        exit;
    }

    $file = $_FILES['file'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid image type. Use JPEG, PNG, GIF, WebP, or SVG.']);
        exit;
    }

    $maxBytes = $type === 'favicon' ? 512 * 1024 : 2 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $type === 'favicon' ? 'Favicon must be under 512 KB' : 'Logo must be under 2 MB'
        ]);
        exit;
    }

    $extMap = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
    ];
    $ext = $extMap[$mime] ?? 'png';

    $uploadDir = __DIR__ . '/../../uploads/branding';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = $type . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $filepath = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        exit;
    }

    $relativePath = 'uploads/branding/' . $filename;
    $publicUrl = resolveAppearanceAssetUrl($relativePath);

    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/settings-helper.php';
    $db = Database::getInstance()->getConnection();

    $settingKey = $type === 'logo' ? 'logo' : 'favicon';
    $stmt = $db->prepare('SELECT id FROM system_settings WHERE category = ? AND setting_key = ? LIMIT 1');
    $stmt->execute(['appearance', $settingKey]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $stmt = $db->prepare('UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$relativePath, $existing['id']]);
    } else {
        $stmt = $db->prepare('
            INSERT INTO system_settings (category, setting_key, setting_value, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ');
        $stmt->execute(['appearance', $settingKey, $relativePath]);
    }

    if ($type === 'favicon') {
        echo json_encode([
            'success' => true,
            'message' => 'Favicon uploaded',
            'path' => $relativePath,
            'url' => $publicUrl,
            'favicon' => $publicUrl
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Logo uploaded',
            'path' => $relativePath,
            'url' => $publicUrl,
            'logo' => $publicUrl
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Upload failed: ' . $e->getMessage()]);
}
