<?php
/**
 * Admin Settings API
 * Handles system settings management
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    $decoded = requireAuth();
    
    // Only admins can access settings
    if (!in_array($decoded['role'], ['admin', 'super-admin'], true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
    
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../utils/settings-helper.php';
    $db = Database::getInstance()->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetSettings($db);
            break;
        case 'POST':
        case 'PUT':
            handleUpdateSettings($db, $decoded);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGetSettings($db) {
    try {
        createSettingsTable($db);

        $stmt = $db->prepare("SELECT * FROM system_settings WHERE category != 'super_admin' ORDER BY category, setting_key");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $organized = getDefaultSettings();

        foreach ($rows as $setting) {
            $category = $setting['category'];
            $key = $setting['setting_key'];
            $value = json_decode($setting['setting_value'], true);
            if ($value === null && $setting['setting_value'] !== 'null') {
                $value = $setting['setting_value'];
            }

            if (!isset($organized[$category])) {
                $organized[$category] = [];
            }

            if (is_array($value) && isset($organized[$category][$key]) && is_array($organized[$category][$key])) {
                $organized[$category][$key] = array_merge($organized[$category][$key], $value);
            } else {
                $organized[$category][$key] = $value;
            }
        }

        $organized = normalizeSettingsResponse($organized);

        echo json_encode([
            'success' => true,
            'settings' => $organized
        ]);

    } catch (Exception $e) {
        throw new Exception('Failed to retrieve settings: ' . $e->getMessage());
    }
}

function handleUpdateSettings($db, $decoded) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['category']) || !isset($data['settings'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category and settings are required']);
            return;
        }
        
        $category = $data['category'];
        [$settings, $policyRedirects] = prepareSettingsForSave($category, $data['settings']);

        if ($decoded['role'] === 'admin' && !in_array($category, ['library', 'library_policies'], true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin can only update library info and library policies']);
            return;
        }
        
        createSettingsTable($db);

        foreach ($policyRedirects as $key => $value) {
            upsertSystemSetting($db, 'library_policies', $key, $value);
        }
        foreach ($settings as $key => $value) {
            upsertSystemSetting($db, $category, $key, $value);
        }
        
        echo json_encode([
            'success' => true,
            'message' => ucfirst($category) . ' settings updated successfully'
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to update settings: ' . $e->getMessage());
    }
}

function createSettingsTable($db) {
    $sql = "
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_setting (category, setting_key)
        )
    ";
    
    $db->exec($sql);
}

function getDefaultSettings() {
    return [
        'library' => [
            'libraryName' => 'Digital Library Management System',
            'description' => 'A comprehensive digital library management solution',
            'address' => '123 Library Street, Education City',
            'phone' => '+1 (555) 123-4567',
            'email' => 'info@digitallibrary.com',
            'website' => 'https://digitallibrary.com',
            'operatingHours' => [
                'monday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
                'tuesday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
                'wednesday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
                'thursday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
                'friday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'saturday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                'sunday' => ['open' => '10:00', 'close' => '16:00', 'closed' => false]
            ],
            'socialMedia' => [
                'facebook' => 'https://facebook.com/digitallibrary',
                'twitter' => 'https://twitter.com/digitallibrary',
                'instagram' => 'https://instagram.com/digitallibrary',
                'linkedin' => 'https://linkedin.com/company/digitallibrary'
            ]
        ],
        'library_policies' => [
            'max_user_borrow_books' => 5,
            'due_fines_per_day' => 0.50,
            'max_book_return_days' => 14,
            'max_reservations_per_user' => 3,
            'grace_period_days' => 3,
            'renewal_limit' => 2,
            'reservation_hold_days' => 7
        ],
        'system' => [
            'maxReservationsPerUser' => 3,
            'reservationHoldDays' => 7,
            'renewalLimit' => 2,
            'gracePeriodDays' => 3,
            'autoRenewal' => true,
            'emailNotifications' => true,
            'smsNotifications' => false,
            'overdueNotificationDays' => [1, 3, 7],
            'maintenanceMode' => false,
            'allowRegistration' => true,
            'requireEmailVerification' => true,
            'sessionTimeout' => 60,
            'passwordMinLength' => 6,
            'passwordRequireSpecial' => false,
            'twoFactorAuth' => false
        ],
        'notifications' => [
            'emailEnabled' => true,
            'smsEnabled' => false,
            'pushEnabled' => true,
            'overdueReminders' => true,
            'reservationAlerts' => true,
            'newBookNotifications' => true,
            'systemAlerts' => true,
            'emailTemplates' => [
                'welcome' => 'Welcome to our Digital Library!',
                'overdue' => 'You have overdue books. Please return them.',
                'reservation' => 'Your reserved book is now available.',
                'renewal' => 'Your book loan has been renewed.'
            ],
            'notificationSchedule' => [
                'overdueCheck' => '09:00',
                'reservationCheck' => '10:00',
                'dailyReport' => '18:00'
            ]
        ],
        'security' => [
            'loginAttempts' => 5,
            'lockoutDuration' => 30,
            'passwordExpiry' => 90,
            'sessionSecurity' => true,
            'ipWhitelist' => [],
            'auditLogging' => true,
            'dataEncryption' => true,
            'backupFrequency' => 'daily',
            'backupRetention' => 30,
            'apiRateLimit' => 100,
            'corsEnabled' => true,
            'httpsOnly' => true
        ],
        'appearance' => [
            'theme' => 'light',
            'primaryColor' => '#4a9b8e',
            'secondaryColor' => '#66bb6a',
            'logo' => null,
            'favicon' => null,
            'customCSS' => '',
            'showBranding' => true,
            'compactMode' => false,
            'animationsEnabled' => true
        ]
    ];
}

/** Policy fields stored only under library_policies (mirrored in API response for legacy UI). */
function policyMirrorMap() {
    return [
        'maxBorrowDays' => 'max_book_return_days',
        'finePerDay' => 'due_fines_per_day',
        'maxBooksPerUser' => 'max_user_borrow_books',
        'maxReservationsPerUser' => 'max_reservations_per_user',
        'gracePeriodDays' => 'grace_period_days',
        'renewalLimit' => 'renewal_limit',
        'reservationHoldDays' => 'reservation_hold_days',
    ];
}

function normalizeSettingsResponse(array $organized) {
    if (isset($organized['library'])) {
        $organized['library'] = normalizeLibrarySettingsOnRead($organized['library']);
        foreach (['maxUserBorrowBooks', 'dueFinesPerDay', 'maxBookReturnDays'] as $legacy) {
            unset($organized['library'][$legacy]);
        }
    }

    if (!isset($organized['library_policies'])) {
        $organized['library_policies'] = getDefaultSettings()['library_policies'];
    }

    foreach (policyMirrorMap() as $camel => $snake) {
        if (isset($organized['library_policies'][$snake])) {
            $organized['system'][$camel] = $organized['library_policies'][$snake];
        }
    }

    if (isset($organized['appearance'])) {
        $organized['appearance'] = normalizeAppearanceSettings($organized['appearance']);
        if (!empty($organized['appearance']['logo'])) {
            $organized['appearance']['logo'] = resolveAppearanceAssetUrl($organized['appearance']['logo']);
        }
        if (!empty($organized['appearance']['favicon'])) {
            $organized['appearance']['favicon'] = resolveAppearanceAssetUrl($organized['appearance']['favicon']);
        }
    } else {
        $organized['appearance'] = getDefaultAppearanceSettings();
    }

    return $organized;
}

function prepareSettingsForSave($category, array $settings) {
    $policyRedirects = [];

    if ($category === 'library') {
        if (isset($settings['library_name']) && empty($settings['libraryName'])) {
            $settings['libraryName'] = $settings['library_name'];
        }
        unset($settings['library_name']);
        return [array_intersect_key($settings, array_flip(LIBRARY_UI_KEYS)), []];
    }

    if ($category === 'system') {
        foreach (policyMirrorMap() as $camel => $snake) {
            if (array_key_exists($camel, $settings)) {
                $policyRedirects[$snake] = $settings[$camel];
                unset($settings[$camel]);
            }
        }
    }

    if ($category === 'library_policies') {
        return [array_intersect_key($settings, array_flip(LIBRARY_POLICY_KEYS)), []];
    }

    if ($category === 'appearance') {
        return [prepareAppearanceForSave($settings), []];
    }

    return [$settings, $policyRedirects];
}

function upsertSystemSetting($db, $category, $key, $value) {
    foreach (DEPRECATED_SETTING_KEYS as [$depCat, $depKey]) {
        if ($depCat === $category && $depKey === $key) {
            return;
        }
    }

    $jsonValue = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

    $stmt = $db->prepare('SELECT id FROM system_settings WHERE category = ? AND setting_key = ? LIMIT 1');
    $stmt->execute([$category, $key]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $stmt = $db->prepare('UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$jsonValue, $existing['id']]);
        return;
    }

    $stmt = $db->prepare('
        INSERT INTO system_settings (category, setting_key, setting_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ');
    $stmt->execute([$category, $key, $jsonValue]);
}
?>
