<?php
/**
 * Super Admin file download (backups & log exports)
 * GET /api/super-admin/download?type=backup|export&file=filename
 */

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();

    if ($decoded['role'] !== 'super-admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Super admin access required']);
        exit;
    }

    $type = $_GET['type'] ?? '';
    $file = basename($_GET['file'] ?? '');

    if ($file === '' || !in_array($type, ['backup', 'export'], true)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Invalid download request']);
        exit;
    }

    $allowedExt = $type === 'backup' ? ['sql'] : ['zip'];
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit;
    }

    $baseDir = $type === 'backup'
        ? realpath(__DIR__ . '/../../backups')
        : realpath(__DIR__ . '/../../exports');

    if ($baseDir === false) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Directory not found']);
        exit;
    }

    $fullPath = realpath($baseDir . DIRECTORY_SEPARATOR . $file);
    if ($fullPath === false || strpos($fullPath, $baseDir) !== 0 || !is_file($fullPath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }

    $mime = $ext === 'zip' ? 'application/zip' : 'application/sql';
    header('Content-Type: ' . $mime);
    header('Content-Disposition: attachment; filename="' . $file . '"');
    header('Content-Length: ' . filesize($fullPath));
    header('Cache-Control: no-store');
    readfile($fullPath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Download failed: ' . $e->getMessage()]);
}
