<?php
/**
 * Chapa Payment Initialization Endpoint
 * POST /api/payments/initialize
 *
 * Body: { "fine_id": 123, "amount": 150.00, "currency": "ETB" }
 * Returns the Chapa checkout_url and the internal payment record id.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../utils/Logger.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    $decoded  = requireAuth();                       // exits with 401 on failure
    $userId   = $decoded['user_id'];
    $userEmail = $decoded['email']     ?? '';
    $userName  = $decoded['full_name'] ?? 'Library User';
    $userPhone = $decoded['phone']     ?? '';

    // ── Input ────────────────────────────────────────────────────────────────
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) {
        throw new Exception('Invalid JSON payload');
    }

    if (empty($body['fine_id']) || !isset($body['amount'])) {
        throw new Exception('Missing required fields: fine_id and amount');
    }

    $fineId   = intval($body['fine_id']);
    $amount   = floatval($body['amount']);
    $currency = $body['currency'] ?? 'ETB';

    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0');
    }

    // ── Chapa key ────────────────────────────────────────────────────────────
    $chapaKey = defined('CHAPA_SECRET_KEY') ? CHAPA_SECRET_KEY : getenv('CHAPA_SECRET_KEY');
    if (!$chapaKey || strpos($chapaKey, 'your-') === 0) {
        throw new Exception('Chapa API key not configured. Contact the administrator.');
    }

    // ── DB ───────────────────────────────────────────────────────────────────
    $db = Database::getInstance()->getConnection();

    // Verify fine belongs to user and is still unpayable
    $stmt = $db->prepare("
        SELECT f.*, u.email as u_email, u.full_name as u_name, u.phone as u_phone
        FROM   fines f
        JOIN   users u ON u.id = f.user_id
        WHERE  f.id = ? AND f.user_id = ?
    ");
    $stmt->execute([$fineId, $userId]);
    $fine = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$fine) {
        throw new Exception('Fine not found or does not belong to you');
    }
    if (($fine['payment_status'] ?? 'unpaid') === 'paid') {
        throw new Exception('This fine has already been paid');
    }

    // Use the DB user data to fill gaps (e.g. if JWT omits phone)
    if (!$userEmail || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        $userEmail = $fine['u_email'];
    }
    if (!$userName)  $userName  = $fine['u_name'];
    if (!$userPhone) $userPhone = $fine['u_phone'] ?? '';

    // Validate email (Chapa is very strict about email format)
    $userEmail = strtolower(trim($userEmail));  // Normalize email
    if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address. Please update your profile with a valid email.');
    }
    
    // For Chapa TEST mode, use a test email format if real email fails
    $chapaMode = getenv('CHAPA_MODE') ?: 'test';
    if ($chapaMode === 'test' && strpos(CHAPA_SECRET_KEY, 'TEST') !== false) {
        // Use a simpler test email format that Chapa accepts
        $userEmail = 'test' . $userId . '@gmail.com';  // Use gmail.com instead of example.com
    }

    $paidAmount = floatval($fine['paid_amount'] ?? 0);
    $balance    = floatval($fine['amount']) - $paidAmount;

    if ($amount > $balance + 0.01) {  // +0.01 for float tolerance
        throw new Exception("Amount ({$amount}) exceeds the balance owed (" . number_format($balance, 2) . " {$currency})");
    }

    // ── Reuse pending payment (< 30 min old) ─────────────────────────────────
    $existStmt = $db->prepare("
        SELECT id, tx_ref, checkout_url
        FROM   payments
        WHERE  fine_id = ? AND user_id = ? AND status = 'pending'
        AND    created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        ORDER  BY created_at DESC
        LIMIT  1
    ");
    $existStmt->execute([$fineId, $userId]);
    $existing = $existStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing && $existing['checkout_url']) {
        Logger::log('payment', 'Reusing existing pending payment', [
            'payment_id' => $existing['id'],
            'tx_ref'     => $existing['tx_ref'],
            'user_id'    => $userId,
        ]);
        echo json_encode([
            'success' => true,
            'message' => 'Using existing pending payment',
            'data'    => [
                'checkout_url' => $existing['checkout_url'],
                'tx_ref'       => $existing['tx_ref'],
                'payment_id'   => intval($existing['id']),
            ],
        ]);
        exit();
    }

    // ── Build Chapa payload ───────────────────────────────────────────────────
    $nameParts = explode(' ', trim($userName), 2);
    $txRef     = 'FINE-' . $userId . '-' . $fineId . '-' . time() . '-' . bin2hex(random_bytes(4));

    $callbackUrl = defined('CHAPA_CALLBACK_URL') ? CHAPA_CALLBACK_URL : getenv('CHAPA_CALLBACK_URL');
    $returnUrl   = (defined('CHAPA_RETURN_URL')  ? CHAPA_RETURN_URL  : getenv('CHAPA_RETURN_URL')) ?: 'http://localhost:3000/payment/return';

    if (!$callbackUrl) $callbackUrl = 'http://localhost:8000/api/payments/callback';

    $payload = [
        'amount'       => number_format($amount, 2, '.', ''),
        'currency'     => $currency,
        'email'        => trim($userEmail),  // Ensure no whitespace
        'first_name'   => $nameParts[0],
        'last_name'    => $nameParts[1] ?? 'User',
        'phone_number' => $userPhone ?: '0900000000',
        'tx_ref'       => $txRef,
        'callback_url' => $callbackUrl,
        'return_url'   => $returnUrl . '?tx_ref=' . urlencode($txRef),
        'customization' => [
            'title'       => 'Fine Payment',  // Max 16 chars
            'description' => 'Fine ' . $fineId . ' - ' . substr(preg_replace('/[^a-zA-Z0-9\s\-_.]/', '', $fine['description'] ?? 'Overdue'), 0, 50),
        ],
        'meta' => ['fine_id' => $fineId, 'user_id' => $userId],
    ];

    // Log payload for debugging
    Logger::log('payment', 'Initializing payment', [
        'payload' => $payload,
        'user_id' => $userId,
        'fine_id' => $fineId,
    ]);

    // ── Call Chapa ────────────────────────────────────────────────────────────
    $ch = curl_init('https://api.chapa.co/v1/transaction/initialize');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $chapaKey,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $raw      = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        throw new Exception("Chapa API connection error: $curlErr");
    }

    $chapaResp = json_decode($raw, true);

    if ($httpCode !== 200 || !$chapaResp || ($chapaResp['status'] ?? '') !== 'success') {
        Logger::log('payment_error', 'Chapa init failed', [
            'http_code' => $httpCode,
            'response'  => $chapaResp,
            'user_id'   => $userId,
            'fine_id'   => $fineId,
        ]);
        
        // Format error message
        $errorMsg = 'Payment gateway error';
        if (isset($chapaResp['message'])) {
            if (is_array($chapaResp['message'])) {
                // Flatten validation errors
                $errors = [];
                foreach ($chapaResp['message'] as $field => $messages) {
                    $errors[] = is_array($messages) ? implode(', ', $messages) : $messages;
                }
                $errorMsg .= ': ' . implode('; ', $errors);
            } else {
                $errorMsg .= ': ' . $chapaResp['message'];
            }
        }
        
        throw new Exception($errorMsg);
    }

    $checkoutUrl = $chapaResp['data']['checkout_url'] ?? null;
    if (!$checkoutUrl) {
        throw new Exception('No checkout URL received from payment gateway');
    }

    // ── Persist payment record ────────────────────────────────────────────────
    $ins = $db->prepare("
        INSERT INTO payments
            (tx_ref, user_id, fine_id, amount, currency, status,
             checkout_url, chapa_response,
             customer_email, customer_phone, customer_name, created_at)
        VALUES
            (?, ?, ?, ?, ?, 'pending',
             ?, ?,
             ?, ?, ?, NOW())
    ");
    $ins->execute([
        $txRef, $userId, $fineId, $amount, $currency,
        $checkoutUrl, json_encode($chapaResp),
        $userEmail, $userPhone, $userName,
    ]);
    $paymentId = intval($db->lastInsertId());

    // Audit log
    _logPaymentEvent($db, $paymentId, $txRef, 'initialization', null, 'pending', $payload, $chapaResp);

    Logger::log('payment', 'Payment initialized', [
        'payment_id' => $paymentId,
        'tx_ref'     => $txRef,
        'amount'     => $amount,
        'user_id'    => $userId,
        'fine_id'    => $fineId,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Payment initialized successfully',
        'data'    => [
            'checkout_url' => $checkoutUrl,
            'tx_ref'       => $txRef,
            'payment_id'   => $paymentId,
            'amount'       => $amount,
            'currency'     => $currency,
        ],
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    Logger::log('payment_error', 'initialize.php: ' . $e->getMessage(), [
        'user_id' => $userId ?? null,
        'fine_id' => $fineId ?? null,
    ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _logPaymentEvent($db, $paymentId, $txRef, $eventType, $statusBefore, $statusAfter, $reqData = null, $resData = null) {
    try {
        $db->prepare("
            INSERT INTO payment_logs
                (payment_id, tx_ref, event_type, status_before, status_after,
                 request_data, response_data, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ")->execute([
            $paymentId, $txRef, $eventType, $statusBefore, $statusAfter,
            $reqData ? json_encode($reqData) : null,
            $resData ? json_encode($resData) : null,
            $_SERVER['REMOTE_ADDR']     ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
        ]);
    } catch (Exception $e) {
        error_log('payment_log insert failed: ' . $e->getMessage());
    }
}
