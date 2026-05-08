<?php
// Debug incoming requests
header('Content-Type: application/json');

echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'path' => parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
    'headers' => getallheaders(),
    'get' => $_GET,
    'post' => $_POST,
    'input' => file_get_contents('php://input'),
    'server' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'REQUEST_URI' => $_SERVER['REQUEST_URI'],
        'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'Not set'
    ]
], JSON_PRETTY_PRINT);
?>