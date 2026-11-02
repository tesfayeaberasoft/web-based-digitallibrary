<?php
/**
 * Database Configuration
 * Handles database connection for the Digital Library Management System
 */
require_once __DIR__ . '/config.php';

class Database {
    private static $instance = null;
    private $isDevelopment;
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->isDevelopment = defined('APP_ENV') && APP_ENV === 'development';
        $this->host = getApplicationEnvironment('DB_HOST', $this->isDevelopment ? 'localhost' : '');
        $this->db_name = getApplicationEnvironment('DB_NAME', $this->isDevelopment ? 'digital_library' : '');
        $this->username = getApplicationEnvironment('DB_USER', $this->isDevelopment ? 'root' : '');
        $this->password = getApplicationEnvironment('DB_PASS');
    }

    /**
     * Get singleton instance
     * @return Database
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Get database connection
     * @return PDO|null
     */
    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        $missingSettings = [];
        foreach ([
            'DB_HOST' => $this->host,
            'DB_NAME' => $this->db_name,
            'DB_USER' => $this->username,
            'DB_PASS' => $this->password,
        ] as $setting => $value) {
            if ($value === '' && !($setting === 'DB_PASS' && $this->isDevelopment)) {
                $missingSettings[] = $setting;
            }
        }

        if ($missingSettings) {
            error_log('Database configuration is missing required settings: ' . implode(', ', $missingSettings));
            return null;
        }

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            return null;
        }

        return $this->conn;
    }
}
?>