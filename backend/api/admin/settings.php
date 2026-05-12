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
        // Get all settings from database
        $stmt = $db->prepare("SELECT * FROM system_settings ORDER BY category, setting_key");
        $stmt->execute();
        $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Organize settings by category
        $organized = [];
        foreach ($settings as $setting) {
            $category = $setting['category'];
            $key = $setting['setting_key'];
            $value = json_decode($setting['setting_value'], true) ?? $setting['setting_value'];
            
            if (!isset($organized[$category])) {
                $organized[$category] = [];
            }
            $organized[$category][$key] = $value;
        }
        
        // If no settings exist, return defaults
        if (empty($organized)) {
            $organized = getDefaultSettings();
        }
        
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
        $settings = $data['settings'];

        if ($decoded['role'] === 'admin' && $category !== 'library') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin can only update library info']);
            return;
        }
        
        // Create settings table if it doesn't exist
        createSettingsTable($db);
        
        // Update each setting
        $stmt = $db->prepare("
            INSERT INTO system_settings (category, setting_key, setting_value, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value), 
            updated_at = CURRENT_TIMESTAMP
        ");
        
        foreach ($settings as $key => $value) {
            $jsonValue = is_array($value) || is_object($value) ? json_encode($value) : $value;
            $stmt->execute([$category, $key, $jsonValue]);
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
            // New Library Policy Fields
            'maxUserBorrowBooks' => 5,
            'dueFinesPerDay' => 0.50,
            'maxBookReturnDays' => 14,
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
        'system' => [
            'maxBorrowDays' => 30,
            'finePerDay' => 0.50,
            'maxBooksPerUser' => 5,
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
?>
