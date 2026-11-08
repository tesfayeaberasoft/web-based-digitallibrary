<?php

function resolveApiRoutePath($requestUri, $rewrittenRoute = null) {
    if (is_string($rewrittenRoute)) {
        $path = '/' . ltrim($rewrittenRoute, '/');
    } else {
        $path = parse_url((string)$requestUri, PHP_URL_PATH);
        if (!is_string($path)) {
            return '/';
        }
    }

    if (preg_match('#^/backend/api(?:/|$)#', $path)) {
        $path = substr($path, strlen('/backend'));
    }

    if (preg_match('#^/api(?:/|$)#', $path)) {
        $path = substr($path, 4);
    }

    $path = '/' . trim($path, '/');
    return $path === '/' ? '/' : $path;
}
