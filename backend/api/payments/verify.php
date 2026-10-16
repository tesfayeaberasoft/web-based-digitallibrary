<?php
/**
 * Chapa Payment Verification Endpoint
 * GET /api/payments/verify?tx_ref=TXREF
 *
 * Verifies payment status with Chapa and updates database.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../utils/Logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $decoded = requireAuth();
    $userId  = $decoded['user_id'];
    $txRef   = $_GET['tx_ref'] ?? null;

    if (!$txRef) {
        throw new Exception('Transaction reference (tx_ref) is required');
    }

    $chapaKey = defined('CHAPA_SECRET_KEY') ? CHAPA_SECRET_KEY : getenv('CHAPA_SECRET_KEY');
    if (!$chapaKey || strpos($chapaKey, 'your-') === 0) {
        throw new Exception('Chapa API key not configured');
    }

    $db = Database::getInstance()->getConnection();

    // Get payment record
    $stmt = $db->prepare("
        SELECT p.*, f.amount as fine_amount, f.paid_amount, f.payment_status as fine_status
        FROM   payments p
        JOIN   fines f ON f.id = p.fine_id
        WHERE  p.tx_ref = ? AND p.user_id = ?
    ");
    $stmt->execute([$txRef, $userId]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        throw new Exception('Payment not found or does not belong to you');
    }

    // If already verified, return cached result
    if ($payment['status'] === 'success') {
        echo json_encode([
            'success' => true,
            'message' => 'Payment was already verified',
            'data'    => [
                'status'      => 'success',
                'amount'      => floatval($payment['amount']),
                'currency'    => $payment['currency'],
                'reference'   => $payment['chapa_reference'],
                'fine_id'     => intval($payment['fine_id']),
                'verified_at' => $payment['verified_at'],
            ],
        ]);
        exit();
    }

    // Verify with Chapa API
    $verifyResp = _chapaVerify($txRef, $chapaKey);
    $newStatus  = $verifyResp['status'] ?? 'failed';

    // Update DB based on verification result
    $updateOk = _updatePaymentStatus($db, $payment, $verifyResp, $newStatus);

    if (!$updateOk) {
        throw new Exception('Payment verification could not be processed');
    }

    if ($newStatus === 'success') {
        echo json_encode([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data'    => [
                'status'          => 'success',
                'amount'          => floatval($verifyResp['amount'] ?? $payment['amount']),
                'currency'        => $verifyResp['currency'] ?? 'ETB',
                'reference'       => $verifyResp['reference'] ?? null,
                'fine_id'         => intval($payment['fine_id']),
                'payment_method'  => $verifyResp['payment_method'] ?? null,
            ],
        ]);
    } else {
        throw new Exception($verifyResp['message'] ?? 'Payment verification failed');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    Logger::log('payment_error', 'verify.php: ' . $e->getMessage(), [
        'tx_ref'   => $txRef ?? null,
        'user_id'  => $userId ?? null,
    ]);
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
        throw new Exception("Chapa API connection error: $curlErr");
    }

    $resp = json_decode($raw, true);

    if ($httpCode !== 200 || !$resp) {
        throw new Exception('Failed to verify payment with Chapa');
    }

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
        'message'       => $resp['message'] ?? 'Payment not successful',
        'full_response' => $resp,
    ];
}

function _updatePaymentStatus($db, $payment, $verifyResp, $newStatus) {
    try {
        $db->beginTransaction();

        $paymentId      = intval($payment['id']);
        $txRef          = $payment['tx_ref'];
        $chapaRef       = $verifyResp['reference']      ?? null;
        $paymentMethod  = $verifyResp['payment_method'] ?? null;

        // Update payment record
        $upd = $db->prepare("
            UPDATE payments
            SET    status = ?, chapa_reference = ?, payment_method = ?,
                   verified_at = NOW(), chapa_response = ?, updated_at = NOW()
            WHERE  id = ?
        ");
        $upd->execute([
            $newStatus,
            $chapaRef,
            $paymentMethod,
            json_encode($verifyResp['full_response'] ?? []),
            $paymentId,
        ]);

        // If success, update fine & potentially unlock user account
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

            // Check for remaining unpaid fines
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

                Logger::log('payment', 'User reactivated', [
                    'user_id'    => intval($payment['user_id']),
                    'payment_id' => $paymentId,
                ]);
            }

            Logger::log('payment', 'Fine updated after verification', [
                'fine_id'     => intval($payment['fine_id']),
                'payment_id'  => $paymentId,
                'fine_status' => $newFineStatus,
                'paid_amount' => $newPaidAmt,
            ]);
        }

        _logPaymentEvent($db, $paymentId, $txRef, 'verification',
            $payment['status'], $newStatus,
            null, $verifyResp['full_response'] ?? []);

        $db->commit();

        Logger::log('payment', 'Payment verified', [
            'payment_id' => $paymentId,
            'tx_ref'     => $txRef,
            'status'     => $newStatus,
            'amount'     => $payment['amount'],
        ]);

        return true;

    } catch (Exception $e) {
        $db->rollBack();
        Logger::log('payment_error', 'Failed to update payment: ' . $e->getMessage(), [
            'payment_id' => $payment['id'] ?? null,
            'tx_ref'     => $payment['tx_ref'] ?? null,
        ]);
        return false;
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
