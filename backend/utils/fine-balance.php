<?php

/**
 * Return the user's outstanding fine rows. Use inside a transaction when
 * $lockRows is true so payment/return operations cannot race past the check.
 */
function getOutstandingFineRows(PDO $db, $userId, $lockRows = false)
{
    $sql = "
        SELECT id, amount, paid_amount
        FROM fines
        WHERE user_id = ?
          AND status NOT IN ('paid', 'waived')
          AND (
              status IN ('pending', 'partial', 'unpaid')
              OR payment_status IN ('unpaid', 'partial')
          )
          AND amount > COALESCE(paid_amount, 0)
    ";
    if ($lockRows) {
        $sql .= ' FOR UPDATE';
    }

    $stmt = $db->prepare($sql);
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function outstandingFineBalance(array $fineRows)
{
    $balance = 0.0;
    foreach ($fineRows as $fine) {
        $balance += max(0, (float)$fine['amount'] - (float)($fine['paid_amount'] ?? 0));
    }
    return $balance;
}
