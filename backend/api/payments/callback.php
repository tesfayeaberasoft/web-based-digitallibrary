<?php
/**
 * Chapa Payment Callback/Webhook Handler
 * POST /api/payments/callback
 *
 * Called by Chapa servers (not users) when payment status changes.
 * Double-verifies with Chapa API for security.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Logger.php';

$raw = file_get_contents('php://input');
Logger::log('payment_callback', 'Received callback', [
    'ip'      => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'headers' => getallheaders(),
    'body'    => $raw,
]);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit();
}

try {
    $data = json_decode($raw, true);
    if (!$data) {
        throw new Exception('Invalid JSON');
    }

    $txRef = $data['tx_ref'] ?? $data['trx_ref'] ?? null;
    if (!$txRef) {
        throw new Exception('Missing tx_ref in callback');
    }

    Logger::log('payment_callback', 'Processing callback', ['tx_ref' => $txRef]);

    $db = Database::getInstance()->getConnection();

    // Get payment record
    $stmt = $db->prepare("
        SELECT p.*, f.amount as fine_amount, f.paid_amount, f.payment_status as fine_status
        FROM   payments p
        JOIN   fines f ON f.id = p.fine_id
        WHERE  p.tx_ref = ?
    ");
    $stmt->execute([$txRef]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        throw new Exception("Payment not found for tx_ref: $txRef");
    }

    // Update callback counter
    $db->prepare("
        UPDATE payments
        SET    callback_attempts = callback_attempts + 1,
               last_callback_at = NOW()
        WHERE  id = ?
    ")->execute([intval($payment['id'])]);

    // If already processed, return OK (idempotent)
    if ($payment['status'] === 'success') {
        Logger::log('payment_callback', 'Payment already processed', [
            'payment_id' => intval($payment['id']),
            'tx_ref'     => $txRef,
        ]);
        http_response_code(200);
        exit();
    }

    $chapaKey = defined('CHAPA_SECRET_KEY') ? CHAPA_SECRET_KEY : getenv('CHAPA_SECRET_KEY');
    if (!$chapaKey || strpos($chapaKey, 'your-') === 0) {
        throw new Exception('Chapa API key not configured');
    }

    // Double-verify with Chapa (don't trust callback alone)
    $verifyResp = _chapaVerify($txRef, $chapaKey);
    $newStatus  = $verifyResp['status'] ?? 'failed';

    // Update payment & fine
    _processVerification($db, $payment, $verifyResp, $newStatus, $data);

    http_response_code(200);
    exit();

} catch (Exception $e) {
    Logger::log('payment_error', 'Callback failed: ' . $e->getMessage(), [
        'tx_ref' => $txRef ?? null,
        'body'   => $raw ?? null,
    ]);
    // Return 200 to Chapa anyway (idempotent webhook)
    http_response_code(200);
    exit();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _chapaVerify($txRef, $secretKey) {
    $ch = curl_init("https://api.chapa.co/v1/transaction/verify/{$txRef}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $secretKey,
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
        throw new Exception("Chapa connection error: $curlErr");
    }

    $resp = json_decode($raw, true);
    if ($httpCode !== 200 || !$resp) {
        throw new Exception('Chapa verify failed');
    }

    Logger::log('payment_callback', 'Chapa verify response', [
        'tx_ref'      => $txRef,
        'http_code'   => $httpCode,
        'chapa_status' => $resp['status'] ?? null,
    ]);

    if (($resp['status'] ?? '') === 'success' && isset($resp['data'])) {
        $data = $resp['data'];
        return [
            'status'         => 'success',
            'amount'         => floatval($data['amount'] ?? 0),
            'currency'       => $data['currency'] ?? 'ETB',
            'reference'      => $data['reference'] ?? $data['trx_ref'] ?? $txRef,
            'payment_method' => $data['method'] ?? null,
            'full_response'  => $resp,
        ];
    }

    return [
        'status'        => 'failed',
        'message'       => $resp['message'] ?? 'Not successful',
        'full_response' => $resp,
    ];
}

function _processVerification($db, $payment, $verifyResp, $newStatus, $callbackData) {
    try {
        $db->beginTransaction();

        $paymentId     = intval($payment['id']);
        $txRef         = $payment['tx_ref'];
        $chapaRef      = $verifyResp['reference']      ?? null;
        $paymentMethod = $verifyResp['payment_method'] ?? null;

        // Update payment record
        $db->prepare("
            UPDATE payments
            SET    status = ?, chapa_reference = ?, payment_method = ?,
                   verified_at = NOW(),
                   chapa_response = ?, updated_at = NOW()
            WHERE  id = ?
        ")->execute([
            $newStatus,
            $chapaRef,
            $paymentMethod,
            json_encode([
                'verification' => $verifyResp['full_response'] ?? [],
                'callback'     => $callbackData,
            ]),
            $paymentId,
        ]);

        if ($newStatus === 'success') {
            $newPaidAmt    = floatval($payment['paid_amount'] ?? 0) + floatval($payment['amount'] ?? 0);
            $newFineStatus = ($newPaidAmt >= floatval($payment['fine_amount'] ?? 0)) ? 'paid' : 'partial';

            $db->prepare("
                UPDATE fines
                SET    payment_status = ?, paid_amount = ?, paid_at = NOW(),
                       payment_id = ?, updated_at = NOW()
                WHERE  id = ?
            ")->execute([
                $newFineStatus,
                $newPaidAmt,
                $paymentId,
                intval($payment['fine_id']),
            ]);

            // Reactivate user if no unpaid fines remain
            $chk = $db->prepare("
                SELECT COUNT(*) as cnt
                FROM   fines
                WHERE  user_id = ? AND payment_status != 'paid'
            ");
            $chk->execute([intval($payment['user_id'])]);
            $unpaidCnt = intval($chk->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0);

            if ($unpaidCnt === 0) {
                $db->prepare("
                    UPDATE users
                    SET    status = 'active', updated_at = NOW()
                    WHERE  id = ?
                ")->execute([intval($payment['user_id'])]);

                Logger::log('payment', 'User reactivated (callback)', [
                    'user_id'    => intval($payment['user_id']),
                    'payment_id' => $paymentId,
                ]);
            }

            Logger::log('payment', 'Fine updated (callback)', [
                'fine_id'     => intval($payment['fine_id']),
                'payment_id'  => $paymentId,
                'fine_status' => $newFineStatus,
                'paid_amount' => $newPaidAmt,
            ]);

        } elseif ($newStatus === 'failed') {
            Logger::log('payment', 'Payment failed (callback)', [
                'payment_id' => $paymentId,
                'tx_ref'     => $txRef,
            ]);
        }

        _logPaymentEvent($db, $paymentId, $txRef, 'callback',
            $payment['status'], $newStatus,
            $callbackData, $verifyResp['full_response'] ?? []);

        $db->commit();

        Logger::log('payment', 'Callback processed', [
            'payment_id' => $paymentId,
            'tx_ref'     => $txRef,
            'status'     => $newStatus,
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        Logger::log('payment_error', 'Process verification failed: ' . $e->getMessage(), [
            'payment_id' => $payment['id'] ?? null,
        ]);
        throw $e;
    }
}

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
