<?php
/**
 * Public appearance settings (theme/branding) for the whole app.
 */
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/settings-helper.php';

    $db = Database::getInstance()->getConnection();
    $appearance = loadAppearanceSettingsFromDb($db);

    echo json_encode([
        'success' => true,
        'appearance' => $appearance
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load appearance settings',
        'appearance' => getDefaultAppearanceSettings()
    ]);
}
