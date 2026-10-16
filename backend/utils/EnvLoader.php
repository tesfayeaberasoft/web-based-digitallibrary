<?php
/**
 * Environment Variable Loader
 * 
 * This utility class loads environment variables from a .env file
 * and makes them available via getenv() and $_ENV
 * 
 * Usage:
 * require_once 'utils/EnvLoader.php';
 * EnvLoader::load(__DIR__ . '/.env');
 * $apiKey = getenv('CHAPA_SECRET_KEY');
 */

class EnvLoader {
    /**
     * Load environment variables from a .env file
     * 
     * @param string $filePath Path to the .env file
     * @return bool True if file was loaded successfully
     */
    public static function load($filePath) {
        if (!file_exists($filePath)) {
            error_log("EnvLoader: .env file not found at $filePath");
            return false;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments and empty lines
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }

            // Parse key=value pairs
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                
                // Set environment variable
                if (!empty($key)) {
                    putenv("$key=$value");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
        
        return true;
    }

    /**
     * Get an environment variable with optional default value
     * 
     * @param string $key Variable name
     * @param mixed $default Default value if variable not found
     * @return mixed Variable value or default
     */
    public static function get($key, $default = null) {
        $value = getenv($key);
        
        if ($value === false) {
            return $default;
        }
        
        // Convert string booleans to actual booleans
        if (strtolower($value) === 'true') {
            return true;
        }
        if (strtolower($value) === 'false') {
            return false;
        }
        
        // Convert string null to actual null
        if (strtolower($value) === 'null') {
            return null;
        }
        
        return $value;
    }

    /**
     * Check if an environment variable is set
     * 
     * @param string $key Variable name
     * @return bool True if variable exists
     */
    public static function has($key) {
        return getenv($key) !== false;
    }

    /**
     * Get all environment variables
     * 
     * @return array All environment variables
     */
    public static function all() {
        return getenv();
    }

    /**
     * Validate required environment variables
     * 
     * @param array $required Array of required variable names
     * @return array Array of missing variables (empty if all present)
     */
    public static function validateRequired(array $required) {
        $missing = [];
        
        foreach ($required as $key) {
            if (!self::has($key) || empty(getenv($key))) {
                $missing[] = $key;
            }
        }
        
        return $missing;
    }

    /**
     * Load environment file and validate required variables
     * 
     * @param string $filePath Path to .env file
     * @param array $required Required variable names
     * @throws Exception if file not found or required variables missing
     */
    public static function loadAndValidate($filePath, array $required = []) {
        if (!self::load($filePath)) {
            throw new Exception("Failed to load environment file: $filePath");
        }

        if (!empty($required)) {
            $missing = self::validateRequired($required);
            
            if (!empty($missing)) {
                throw new Exception(
                    "Missing required environment variables: " . implode(', ', $missing)
                );
            }
        }
    }
}

// Auto-load .env file if this file is included
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    EnvLoader::load($envPath);
}
