<?php
/**
 * Super Admin Security Operations API
 * GET  - security overview (failed logins, inactive admins, blocklist)
 * POST - security actions (clear, block/unblock IP)
 */

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../utils/jwt.php';
    require_once __DIR__ . '/../../utils/security-helper.php';

    $decoded = requireAuth();
    if ($decoded['role'] !== 'super-admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Super admin access required']);
        exit;
    }

    require_once __DIR__ . '/../../config/database.php';
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $hours = isset($_GET['hours']) ? (int) $_GET['hours'] : null;
        $attemptsPage = isset($_GET['login_attempts_page']) ? (int) $_GET['login_attempts_page'] : 1;
        $attemptsPerPage = isset($_GET['login_attempts_per_page']) ? (int) $_GET['login_attempts_per_page'] : 10;
        $overview = buildSecurityOverview($db, $attemptsPage, $attemptsPerPage);

        if ($hours === 24 || $hours === 168) {
            $overview['failed_period'] = getFailedLoginSummary($db, $hours === 168 ? 168 : 24);
        }

        echo json_encode(['success' => true, 'data' => $overview]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $action = $input['action'] ?? '';

        switch ($action) {
            case 'clear_failed_logins':
                $cleared = clearFailedLoginAttempts($db);
                echo json_encode([
                    'success' => true,
                    'message' => "Cleared {$cleared} failed login attempt(s)",
                    'cleared' => $cleared,
                    'data' => buildSecurityOverview($db),
                ]);
                break;

            case 'clear_ip_attempts':
                $ip = trim($input['ip'] ?? '');
                if (!filter_var($ip, FILTER_VALIDATE_IP)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Valid IP address is required']);
                    break;
                }
                $cleared = clearFailedLoginAttempts($db, $ip);
                echo json_encode([
                    'success' => true,
                    'message' => "Cleared {$cleared} failed attempt(s) for {$ip}",
                    'cleared' => $cleared,
                    'data' => buildSecurityOverview($db),
                ]);
                break;

            case 'clear_email_attempts':
                $email = trim($input['email'] ?? '');
                if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Valid email is required']);
                    break;
                }
                $cleared = clearFailedLoginAttempts($db, null, $email);
                echo json_encode([
                    'success' => true,
                    'message' => "Cleared {$cleared} failed attempt(s) for {$email}",
                    'cleared' => $cleared,
                    'data' => buildSecurityOverview($db),
                ]);
                break;

            case 'block_ip':
                $ip = trim($input['ip'] ?? '');
                blockIpAddress($db, $ip);
                $settings = getSuperAdminSecuritySettings($db);
                $settings['ip_restrictions'] = true;
                saveSuperAdminSecuritySettings($db, $settings);
                echo json_encode([
                    'success' => true,
                    'message' => "Blocked IP {$ip}",
                    'data' => buildSecurityOverview($db),
                ]);
                break;

            case 'unblock_ip':
                $ip = trim($input['ip'] ?? '');
                unblockIpAddress($db, $ip);
                echo json_encode([
                    'success' => true,
                    'message' => "Unblocked IP {$ip}",
                    'data' => buildSecurityOverview($db),
                ]);
                break;

            case 'run_scan':
                $overview = buildSecurityOverview($db);
                $issues = (int) $overview['summary']['suspicious_ips']
                    + (int) $overview['summary']['inactive_admins']
                    + ((int) $overview['summary']['failed_logins_24h'] >= (int) $overview['settings']['failed_login_threshold'] ? 1 : 0);
                echo json_encode([
                    'success' => true,
                    'message' => "Security scan complete. {$issues} issue area(s) need attention.",
                    'data' => $overview,
                ]);
                break;

            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Security operation failed: ' . $e->getMessage()]);
}
