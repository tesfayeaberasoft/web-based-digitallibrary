<?php
/**
 * Test Loans API
 * Run this file to test if the loans API is working
 * Usage: php test_loans_api.php
 */

// Simulate API call
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';

// You need to replace this with a real token from your login
// To get a token: Login to the app, open browser console, type: localStorage.getItem('token')
$test_token = 'YOUR_TOKEN_HERE';

// Simulate Authorization header
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $test_token;

// Include the API file
include __DIR__ . '/api/loans/list.php';
?>
