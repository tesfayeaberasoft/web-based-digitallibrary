<?php
/**
 * Super Admin Download API
 * Handles file downloads for exports and backups
 */

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only super-admins and librarians can download
    if (!in_array($decoded['role'], ['super-admin', 'admin', 'librarian'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    $type = $_GET['type'] ?? '';
    $file = $_GET['file'] ?? '';
    
    if (empty($type) || empty($file)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
        exit;
    }
    
    // Sanitize filename
    $file = basename($file);
    
    // Determine directory based on type
    switch ($type) {
        case 'export':
            $dir = __DIR__ . '/../../exports/';
            break;
        case 'backup':
            $dir = __DIR__ . '/../../backups/';
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid download type']);
            exit;
    }
    
    // Ensure directory exists
    if (!is_dir($dir)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Export directory not found']);
        exit;
    }
    
    $filepath = $dir . $file;
    
    if (!file_exists($filepath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }
    
    // Set headers for download
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filepath));
    
    // Clear output buffer
    ob_clean();
    flush();
    
    // Read file and send to output
    readfile($filepath);
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Download failed: ' . $e->getMessage()]);
}
?>
