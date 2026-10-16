<?php
/**
 * Logger Utility
 * Simple file-based logger for payment and application events
 */

class Logger {
    private static $logDir = null;

    /**
     * Get the log directory, creating it if needed
     */
    private static function getLogDir() {
        if (self::$logDir === null) {
            self::$logDir = __DIR__ . '/../logs';
        }
        if (!is_dir(self::$logDir)) {
            mkdir(self::$logDir, 0755, true);
        }
        return self::$logDir;
    }

    /**
     * Write a log entry
     *
     * @param string $channel  Log channel / filename prefix (e.g. 'payment', 'error')
     * @param string $message  Human-readable message
     * @param array  $context  Optional key-value context data
     */
    public static function log($channel, $message, $context = []) {
        $logDir  = self::getLogDir();
        $date    = date('Y-m-d');
        $time    = date('Y-m-d H:i:s');
        $file    = $logDir . '/' . $channel . '-' . $date . '.log';

        $entry  = "[$time] $message";
        if (!empty($context)) {
            // Mask sensitive keys before logging
            $safe = self::maskSensitive($context);
            $entry .= ' | ' . json_encode($safe, JSON_UNESCAPED_UNICODE);
        }
        $entry .= PHP_EOL;

        file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);

        // Also write to PHP error log for critical channels
        if (strpos($channel, 'error') !== false) {
            error_log("[{$channel}] $message");
        }
    }

    /**
     * Mask common sensitive keys so they never appear in log files
     */
    private static function maskSensitive(array $data) {
        $sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'authorization'];
        $result = [];
        foreach ($data as $k => $v) {
            if (in_array(strtolower($k), $sensitiveKeys, true)) {
                $result[$k] = '***MASKED***';
            } elseif (is_array($v)) {
                $result[$k] = self::maskSensitive($v);
            } else {
                $result[$k] = $v;
            }
        }
        return $result;
    }
}
