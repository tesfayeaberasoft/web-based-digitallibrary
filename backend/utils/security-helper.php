<?php
/**
 * Security helpers: login attempts, IP blocklist, client IP detection.
 */

require_once __DIR__ . '/settings-helper.php';

function getClientIpAddress() {
    $headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (empty($_SERVER[$header])) {
            continue;
        }
        $value = $_SERVER[$header];
        if ($header === 'HTTP_X_FORWARDED_FOR') {
            $parts = explode(',', $value);
            $value = trim($parts[0]);
        }
        if (filter_var($value, FILTER_VALIDATE_IP)) {
            return $value;
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function ensureLoginAttemptsTable($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            success TINYINT(1) DEFAULT 0,
            attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_email (email),
            KEY idx_ip (ip_address),
            KEY idx_attempted_at (attempted_at),
            KEY idx_success (success)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
}

function logLoginAttempt($db, $email, $success, $ipAddress = null) {
    try {
        ensureLoginAttemptsTable($db);
        $ip = $ipAddress ?: getClientIpAddress();
        $stmt = $db->prepare("
            INSERT INTO login_attempts (email, ip_address, success, attempted_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$email, $ip, $success ? 1 : 0]);
    } catch (Exception $e) {
        error_log('logLoginAttempt failed: ' . $e->getMessage());
    }
}

function getBlockedIpList($db) {
    try {
        $security = getSuperAdminSecuritySettings($db);
        $list = $security['blocked_ips'] ?? [];
        return is_array($list) ? array_values(array_unique(array_filter(array_map('trim', $list)))) : [];
    } catch (Exception $e) {
        return [];
    }
}

function saveBlockedIpList($db, array $ips) {
    $security = getSuperAdminSecuritySettings($db);
    $normalized = [];
    foreach ($ips as $ip) {
        $ip = trim((string) $ip);
        if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
            $normalized[] = $ip;
        }
    }
    $security['blocked_ips'] = array_values(array_unique($normalized));
    return saveSuperAdminSecuritySettings($db, $security);
}

function isIpBlocked($db, $ipAddress = null) {
    $ip = $ipAddress ?: getClientIpAddress();
    $blocked = getBlockedIpList($db);
    return in_array($ip, $blocked, true);
}

function getSuperAdminSecuritySettings($db) {
    $defaults = [
        'two_factor_auth' => true,
        'login_monitoring' => true,
        'ip_restrictions' => false,
        'max_login_attempts' => 5,
        'session_timeout_minutes' => 60,
        'failed_login_alerts' => true,
        'suspicious_activity_detection' => true,
        'realtime_security_scanning' => false,
        'failed_login_threshold' => 10,
        'blocked_ips' => [],
    ];

    try {
        $stmt = $db->prepare("
            SELECT setting_value FROM system_settings
            WHERE category = 'super_admin' AND setting_key = 'security'
            LIMIT 1
        ");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $decoded = json_decode($row['setting_value'], true);
            if (is_array($decoded)) {
                return array_merge($defaults, $decoded);
            }
        }
    } catch (Exception $e) {
        // use defaults
    }

    return $defaults;
}

function saveSuperAdminSecuritySettings($db, array $security) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_setting (category, setting_key)
        )
    ");

    $stmt = $db->prepare("
        INSERT INTO system_settings (category, setting_key, setting_value, updated_at)
        VALUES ('super_admin', 'security', ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([json_encode($security)]);
    return $security;
}

function blockIpAddress($db, $ip) {
    $ip = trim($ip);
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        throw new InvalidArgumentException('Invalid IP address');
    }
    $list = getBlockedIpList($db);
    if (!in_array($ip, $list, true)) {
        $list[] = $ip;
        saveBlockedIpList($db, $list);
    }
    return $list;
}

function unblockIpAddress($db, $ip) {
    $ip = trim($ip);
    $list = array_values(array_filter(getBlockedIpList($db), fn($item) => $item !== $ip));
    saveBlockedIpList($db, $list);
    return $list;
}

function getFailedLoginSummary($db, $hours = 24) {
    ensureLoginAttemptsTable($db);
    $hours = max(1, min(168, (int) $hours));

    $summaryStmt = $db->prepare("
        SELECT
            COUNT(*) AS total_failed,
            COUNT(DISTINCT ip_address) AS unique_ips,
            COUNT(DISTINCT email) AS unique_emails
        FROM login_attempts
        WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    ");
    $summaryStmt->execute([$hours]);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $byIpStmt = $db->prepare("
        SELECT ip_address, COUNT(*) AS attempts, MAX(attempted_at) AS last_attempt
        FROM login_attempts
        WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY ip_address
        ORDER BY attempts DESC
        LIMIT 50
    ");
    $byIpStmt->execute([$hours]);
    $byIp = $byIpStmt->fetchAll(PDO::FETCH_ASSOC);

    $byEmailStmt = $db->prepare("
        SELECT email, COUNT(*) AS attempts, MAX(attempted_at) AS last_attempt
        FROM login_attempts
        WHERE success = 0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY email
        ORDER BY attempts DESC
        LIMIT 50
    ");
    $byEmailStmt->execute([$hours]);
    $byEmail = $byEmailStmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        'period_hours' => $hours,
        'total_failed' => (int) ($summary['total_failed'] ?? 0),
        'unique_ips' => (int) ($summary['unique_ips'] ?? 0),
        'unique_emails' => (int) ($summary['unique_emails'] ?? 0),
        'by_ip' => $byIp,
        'by_email' => $byEmail,
    ];
}

function getInactiveAdminAccounts($db, $inactiveDays = 90) {
    $inactiveDays = max(30, (int) $inactiveDays);
    $stmt = $db->prepare("
        SELECT id, user_id, full_name, email, role, status, last_login,
               DATEDIFF(NOW(), COALESCE(last_login, created_at)) AS days_inactive
        FROM users
        WHERE role IN ('admin', 'super-admin')
          AND (last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL ? DAY))
        ORDER BY last_login IS NULL DESC, last_login ASC
        LIMIT 100
    ");
    $stmt->execute([$inactiveDays]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getRecentLoginAttempts($db, $limit = 30) {
    $result = getRecentLoginAttemptsPaginated($db, 1, $limit);
    return $result['items'];
}

function getRecentLoginAttemptsPaginated($db, $page = 1, $perPage = 10) {
    ensureLoginAttemptsTable($db);
    $page = max(1, (int) $page);
    $perPage = max(1, min(50, (int) $perPage));
    $offset = ($page - 1) * $perPage;

    $total = (int) $db->query('SELECT COUNT(*) FROM login_attempts')->fetchColumn();
    $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 0;

    if ($page > $totalPages && $totalPages > 0) {
        $page = $totalPages;
        $offset = ($page - 1) * $perPage;
    }

    $stmt = $db->prepare("
        SELECT id, email, ip_address, success, attempted_at
        FROM login_attempts
        ORDER BY attempted_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return [
        'items' => $stmt->fetchAll(PDO::FETCH_ASSOC),
        'pagination' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages,
            'has_prev' => $page > 1,
            'has_next' => $page < $totalPages,
        ],
    ];
}

function getSuspiciousIpRows($db, $hours = 24, $threshold = 10) {
    ensureLoginAttemptsTable($db);
    $stmt = $db->prepare("
        SELECT ip_address, COUNT(*) AS attempts, MAX(attempted_at) AS last_attempt
        FROM login_attempts
        WHERE success = 0
          AND attempted_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
          AND ip_address IS NOT NULL
        GROUP BY ip_address
        HAVING attempts >= ?
        ORDER BY attempts DESC
    ");
    $stmt->execute([$hours, $threshold]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function securityTableHasColumn($db, $table, $column) {
    try {
        $stmt = $db->prepare("SHOW COLUMNS FROM `{$table}` LIKE ?");
        $stmt->execute([$column]);
        return (bool) $stmt->fetchColumn();
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Max failed logins before auto-suspending regular user accounts (admin-configurable).
 */
function getUserMaxLoginAttempts($db) {
    $settings = getSuperAdminSecuritySettings($db);
    $fromSuper = (int) ($settings['max_login_attempts'] ?? 0);
    $fromAdmin = (int) getAppSetting($db, 'security', 'loginAttempts', 0);
    $max = $fromSuper > 0 ? $fromSuper : ($fromAdmin > 0 ? $fromAdmin : 5);
    return max(3, min(20, $max));
}

/** @deprecated Use getUserMaxLoginAttempts */
function getLibrarianMaxLoginAttempts($db) {
    return getUserMaxLoginAttempts($db);
}

function countFailedAttemptsSinceLastSuccess($db, $email) {
    ensureLoginAttemptsTable($db);
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE email = ? AND success = 0
        AND attempted_at > COALESCE(
            (SELECT MAX(attempted_at) FROM login_attempts WHERE email = ? AND success = 1),
            '1970-01-01 00:00:00'
        )
    ");
    $stmt->execute([$email, $email]);
    return (int) $stmt->fetchColumn();
}

function isRegularUserRole($role) {
    return strtolower(trim((string) $role)) === 'user';
}

function suspendRegularUserForFailedLogins($db, $userId, $maxAttempts) {
    $reason = "Automatic suspension: exceeded {$maxAttempts} failed login attempts. Contact an administrator to reactivate your account.";

    if (securityTableHasColumn($db, 'users', 'suspension_reason')) {
        $stmt = $db->prepare("UPDATE users SET status = 'suspended', suspension_reason = ? WHERE id = ? AND role = 'user'");
        $stmt->execute([$reason, $userId]);
    } else {
        $stmt = $db->prepare("UPDATE users SET status = 'suspended' WHERE id = ? AND role = 'user'");
        $stmt->execute([$userId]);
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'general', 'Account Suspended', ?)
        ");
        $stmt->execute([
            $userId,
            'Your account was suspended after too many failed login attempts. Please contact the library administrator.'
        ]);
    } catch (Exception $e) {
        error_log('suspendRegularUserForFailedLogins notification: ' . $e->getMessage());
    }

    try {
        if (securityTableHasColumn($db, 'audit_logs', 'id')) {
            $stmt = $db->prepare("
                INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, new_values)
                VALUES (?, 'auto_suspend_user', 'users', ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $userId,
                getClientIpAddress(),
                json_encode(['reason' => $reason, 'max_attempts' => $maxAttempts])
            ]);
        }
    } catch (Exception $e) {
        error_log('suspendRegularUserForFailedLogins audit: ' . $e->getMessage());
    }
}

/**
 * Record failed login for a regular user and suspend when limit is reached.
 */
function handleRegularUserFailedLogin($db, array $user, $clientIp) {
    $email = $user['email'];
    $maxAttempts = getUserMaxLoginAttempts($db);

    logLoginAttempt($db, $email, false, $clientIp);
    $failedCount = countFailedAttemptsSinceLastSuccess($db, $email);
    $remaining = max(0, $maxAttempts - $failedCount);

    if ($failedCount >= $maxAttempts) {
        suspendRegularUserForFailedLogins($db, (int) $user['id'], $maxAttempts);
        return [
            'max_attempts' => $maxAttempts,
            'failed_attempts' => $failedCount,
            'remaining_attempts' => 0,
            'account_suspended' => true,
            'user_lockout' => true,
        ];
    }

    return [
        'max_attempts' => $maxAttempts,
        'failed_attempts' => $failedCount,
        'remaining_attempts' => $remaining,
        'account_suspended' => false,
        'user_lockout' => true,
    ];
}

function getRegularUserLockoutStatus($db, $email) {
    $maxAttempts = getUserMaxLoginAttempts($db);
    $stmt = $db->prepare("SELECT id, role, status FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([trim($email)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !isRegularUserRole($user['role'])) {
        return null;
    }

    $failedCount = countFailedAttemptsSinceLastSuccess($db, $email);
    $remaining = max(0, $maxAttempts - $failedCount);

    return [
        'is_regular_user' => true,
        'max_attempts' => $maxAttempts,
        'failed_attempts' => $failedCount,
        'remaining_attempts' => $user['status'] === 'suspended' ? 0 : $remaining,
        'account_suspended' => $user['status'] === 'suspended',
    ];
}

function loginLockoutJsonExtras(array $lockout) {
    return [
        'user_lockout' => true,
        'max_attempts' => (int) $lockout['max_attempts'],
        'failed_attempts' => (int) $lockout['failed_attempts'],
        'remaining_attempts' => (int) $lockout['remaining_attempts'],
        'account_suspended' => (bool) $lockout['account_suspended'],
    ];
}

function clearFailedLoginAttempts($db, $ip = null, $email = null) {
    ensureLoginAttemptsTable($db);
    if ($ip) {
        $stmt = $db->prepare("DELETE FROM login_attempts WHERE success = 0 AND ip_address = ?");
        $stmt->execute([$ip]);
    } elseif ($email) {
        $stmt = $db->prepare("DELETE FROM login_attempts WHERE success = 0 AND email = ?");
        $stmt->execute([$email]);
    } else {
        $stmt = $db->prepare("DELETE FROM login_attempts WHERE success = 0");
        $stmt->execute();
    }
    return $stmt->rowCount();
}

function buildSecurityOverview($db, $attemptsPage = 1, $attemptsPerPage = 10) {
    $settings = getSuperAdminSecuritySettings($db);
    $threshold = (int) ($settings['failed_login_threshold'] ?? 10);

    $failed24 = getFailedLoginSummary($db, 24);
    $failed7d = getFailedLoginSummary($db, 168);
    $inactiveAdmins = getInactiveAdminAccounts($db);
    $blockedIps = getBlockedIpList($db);
    $suspiciousIps = getSuspiciousIpRows($db, 24, $threshold);
    $recentAttempts = getRecentLoginAttemptsPaginated($db, $attemptsPage, $attemptsPerPage);

    return [
        'settings' => [
            'failed_login_threshold' => $threshold,
            'ip_restrictions' => (bool) ($settings['ip_restrictions'] ?? false),
            'max_login_attempts' => (int) ($settings['max_login_attempts'] ?? 5),
        ],
        'summary' => [
            'failed_logins_24h' => $failed24['total_failed'],
            'failed_logins_7d' => $failed7d['total_failed'],
            'suspicious_ips' => count($suspiciousIps),
            'inactive_admins' => count($inactiveAdmins),
            'blocked_ips' => count($blockedIps),
        ],
        'failed_24h' => $failed24,
        'failed_7d' => $failed7d,
        'suspicious_ips' => $suspiciousIps,
        'inactive_admins' => $inactiveAdmins,
        'blocked_ips' => $blockedIps,
        'recent_attempts' => $recentAttempts['items'],
        'recent_attempts_pagination' => $recentAttempts['pagination'],
        'server_time' => date('Y-m-d H:i:s'),
    ];
}
