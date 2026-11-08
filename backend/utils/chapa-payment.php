<?php

function chapaVerifiedPaymentMatches($payment, $verification) {
    if (!isset($payment['amount'], $payment['currency'], $verification['amount'], $verification['currency'])
        || !is_numeric($payment['amount'])
        || !is_numeric($verification['amount'])
    ) {
        return false;
    }

    return round((float)$payment['amount'], 2) === round((float)$verification['amount'], 2)
        && strtoupper((string)$payment['currency']) === strtoupper((string)$verification['currency']);
}
