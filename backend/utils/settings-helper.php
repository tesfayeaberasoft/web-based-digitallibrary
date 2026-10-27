<?php
/**
 * Centralized system_settings read/write helpers.
 */

/** Keys that belong in library (camelCase for admin UI) */
const LIBRARY_UI_KEYS = ['libraryName', 'description', 'address', 'phone', 'email', 'website', 'operatingHours', 'socialMedia'];

/** Keys used by loans/fines APIs (snake_case, category library_policies) */
const LIBRARY_POLICY_KEYS = [
    'max_user_borrow_books',
    'due_fines_per_day',
    'max_book_return_days',
    'max_reservations_per_user',
    'grace_period_days',
    'renewal_limit',
    'reservation_hold_days'
];

/** Legacy keys to remove (duplicates or obsolete) */
const DEPRECATED_SETTING_KEYS = [
    ['library', 'library_name'],
    ['system', 'maxBorrowDays'],
    ['system', 'finePerDay'],
    ['system', 'maxBooksPerUser'],
    ['system', 'max_renewal_count'],
    ['library_policies', 'reservation_expiry_days'],
];

function settingsCategoryAliases($category) {
    $map = [
        'system_config' => ['system_config', 'system'],
        'system' => ['system', 'system_config'],
        'library_info' => ['library', 'library_info'],
        'library' => ['library', 'library_info'],
    ];
    return $map[$category] ?? [$category];
}

function normalizeLibrarySettingsOnRead(array $library) {
    if (isset($library['library_name']) && empty($library['libraryName'])) {
        $library['libraryName'] = $library['library_name'];
    }
    unset($library['library_name']);
    return $library;
}

/** snake_case (legacy) => camelCase (admin UI / system category) */
const SETTING_KEY_ALIASES = [
    'allow_registration' => 'allowRegistration',
    'require_email_verification' => 'requireEmailVerification',
    'password_min_length' => 'passwordMinLength',
    'password_require_special' => 'passwordRequireSpecial',
];

function settingKeysToTry($settingKey) {
    $keys = [$settingKey];
    if (isset(SETTING_KEY_ALIASES[$settingKey])) {
        $keys[] = SETTING_KEY_ALIASES[$settingKey];
    }
    foreach (SETTING_KEY_ALIASES as $snake => $camel) {
        if ($camel === $settingKey) {
            $keys[] = $snake;
        }
    }
    return array_values(array_unique($keys));
}

function getAppSetting($db, $category, $settingKey, $defaultValue = null) {
    try {
        $categories = settingsCategoryAliases($category);
        $keys = settingKeysToTry($settingKey);
        $catPh = implode(',', array_fill(0, count($categories), '?'));
        $keyPh = implode(',', array_fill(0, count($keys), '?'));
        $params = array_merge($categories, $keys);
        $stmt = $db->prepare("
            SELECT setting_value FROM system_settings
            WHERE category IN ($catPh) AND setting_key IN ($keyPh)
            ORDER BY updated_at DESC
            LIMIT 1
        ");
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return $defaultValue;
        }
        return castSettingValue($row['setting_value'], $defaultValue);
    } catch (Exception $e) {
        return $defaultValue;
    }
}

function castSettingValue($value, $defaultValue = null) {
    $decoded = json_decode($value, true);
    if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
        return $decoded;
    }
    if (is_bool($defaultValue)) {
        return in_array(strtolower((string) $value), ['true', '1', 'yes'], true);
    }
    if (is_int($defaultValue)) {
        return (int) $value;
    }
    if (is_float($defaultValue)) {
        return (float) $value;
    }
    return $value;
}

function getLibraryPolicySetting($db, $settingKey, $defaultValue = null) {
    return getAppSetting($db, 'library_policies', $settingKey, $defaultValue);
}

/** Appearance settings (camelCase in API) */
const APPEARANCE_KEYS = [
    'theme',
    'primaryColor',
    'secondaryColor',
    'logo',
    'favicon',
    'customCSS',
    'showBranding',
    'compactMode',
    'animationsEnabled',
];

const APPEARANCE_KEY_ALIASES = [
    'primary_color' => 'primaryColor',
    'secondary_color' => 'secondaryColor',
    'custom_css' => 'customCSS',
    'show_branding' => 'showBranding',
    'compact_mode' => 'compactMode',
    'animations_enabled' => 'animationsEnabled',
];

function ensureSettingsTableSchema($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(50) NOT NULL DEFAULT 'system',
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_setting (category, setting_key)
        )
    ");

    $columns = $db->query('SHOW COLUMNS FROM system_settings')->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('category', $columns, true)) {
        $db->exec("ALTER TABLE system_settings ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'system' AFTER id");
    }

    $legacySettings = [
        'library_name' => ['library', 'libraryName'],
        'max_books_per_user' => ['library_policies', 'max_user_borrow_books'],
        'fine_per_day' => ['library_policies', 'due_fines_per_day'],
        'max_borrow_days' => ['library_policies', 'max_book_return_days'],
        'max_renewal_count' => ['library_policies', 'renewal_limit'],
        'chapa_public_key' => ['integration_secrets', 'chapa_public_key'],
        'chapa_secret_key' => ['integration_secrets', 'chapa_secret_key'],
        'google_books_api_key' => ['integration_secrets', 'google_books_api_key'],
        'sendgrid_api_key' => ['integration_secrets', 'sendgrid_api_key'],
    ];

    $update = $db->prepare('UPDATE system_settings SET category = ?, setting_key = ? WHERE setting_key = ?');
    foreach ($legacySettings as $legacyKey => [$category, $key]) {
        $update->execute([$category, $key, $legacyKey]);
    }

    $indexes = [];
    foreach ($db->query('SHOW INDEX FROM system_settings') as $index) {
        $indexes[$index['Key_name']]['unique'] = (int) $index['Non_unique'] === 0;
        $indexes[$index['Key_name']]['columns'][(int) $index['Seq_in_index']] = $index['Column_name'];
    }

    foreach ($indexes as $name => $index) {
        $indexColumns = array_values($index['columns']);
        if ($name !== 'PRIMARY' && $index['unique'] && $indexColumns === ['setting_key']) {
            $db->exec('ALTER TABLE system_settings DROP INDEX `' . str_replace('`', '``', $name) . '`');
        }
    }

    $hasCategoryKeyIndex = false;
    foreach ($indexes as $index) {
        if ($index['unique'] && array_values($index['columns']) === ['category', 'setting_key']) {
            $hasCategoryKeyIndex = true;
            break;
        }
    }
    if (!$hasCategoryKeyIndex) {
        $db->exec('ALTER TABLE system_settings ADD UNIQUE KEY unique_setting (category, setting_key)');
    }
}

function getDefaultAppearanceSettings() {
    return [
        'theme' => 'light',
        'primaryColor' => '#4a9b8e',
        'secondaryColor' => '#66bb6a',
        'logo' => null,
        'favicon' => null,
        'customCSS' => '',
        'showBranding' => true,
        'compactMode' => false,
        'animationsEnabled' => true,
    ];
}

function normalizeAppearanceSettings(array $raw) {
    $defaults = getDefaultAppearanceSettings();
    $out = $defaults;

    foreach ($raw as $key => $value) {
        $camel = APPEARANCE_KEY_ALIASES[$key] ?? $key;
        if (!in_array($camel, APPEARANCE_KEYS, true)) {
            continue;
        }
        $out[$camel] = castAppearanceValue($camel, $value, $defaults[$camel]);
    }

    return $out;
}

function castAppearanceValue($key, $value, $default) {
    if ($value === null || $value === '') {
        return in_array($key, ['logo', 'favicon', 'customCSS'], true) ? ($key === 'customCSS' ? '' : null) : $default;
    }

    if (in_array($key, ['showBranding', 'compactMode', 'animationsEnabled'], true)) {
        if (is_bool($value)) {
            return $value;
        }
        return in_array(strtolower((string) $value), ['true', '1', 'yes', 'on'], true);
    }

    if ($key === 'theme') {
        $v = strtolower((string) $value);
        return in_array($v, ['light', 'dark', 'auto'], true) ? $v : 'light';
    }

    return $value;
}

function prepareAppearanceForSave(array $settings) {
    $normalized = normalizeAppearanceSettings($settings);
    $prepared = [];

    foreach (APPEARANCE_KEYS as $key) {
        $val = $normalized[$key];
        if (is_bool($val)) {
            $prepared[$key] = $val ? 'true' : 'false';
        } elseif ($val === null) {
            $prepared[$key] = '';
        } else {
            $prepared[$key] = (string) $val;
        }
    }

    return $prepared;
}

function resolveAppearanceAssetUrl($path) {
    if (empty($path)) {
        return null;
    }
    if (preg_match('#^https?://#i', $path)) {
        return $path;
    }
    $base = defined('API_PUBLIC_URL') ? API_PUBLIC_URL : 'http://localhost:8000';
    return rtrim($base, '/') . '/' . ltrim($path, '/');
}

function loadAppearanceSettingsFromDb($db) {
    $defaults = getDefaultAppearanceSettings();
    $raw = [];

    try {
        $stmt = $db->prepare("
            SELECT setting_key, setting_value
            FROM system_settings
            WHERE category = 'appearance'
        ");
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $raw[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) {
        return $defaults;
    }

    $appearance = normalizeAppearanceSettings($raw);
    if (!empty($appearance['logo'])) {
        $appearance['logo'] = resolveAppearanceAssetUrl($appearance['logo']);
    }
    if (!empty($appearance['favicon'])) {
        $appearance['favicon'] = resolveAppearanceAssetUrl($appearance['favicon']);
    }

    return $appearance;
}
