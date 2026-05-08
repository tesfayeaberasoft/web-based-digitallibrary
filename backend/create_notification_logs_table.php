<?php
/**
 * Create notification_logs and notification_settings tables
 * Run this script once to create the required tables for the notification system
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Creating notification system tables...\n";
    
    // Create notification_logs table
    $sql_logs = "
    CREATE TABLE IF NOT EXISTS notification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        type ENUM('email', 'sms', 'push') NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        error_message TEXT NULL,
        related_id INT NULL,
        related_type VARCHAR(50) NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at),
        INDEX idx_related (related_id, related_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql_logs);
    echo "✅ notification_logs table created successfully\n";
    
    // Create notification_settings table
    $sql_settings = "
    CREATE TABLE IF NOT EXISTS notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        email_enabled BOOLEAN DEFAULT TRUE,
        sms_enabled BOOLEAN DEFAULT FALSE,
        push_enabled BOOLEAN DEFAULT TRUE,
        due_reminder_days JSON DEFAULT '[3, 1]',
        overdue_reminder_days JSON DEFAULT '[1, 3, 7]',
        reservation_notifications BOOLEAN DEFAULT TRUE,
        fine_notifications BOOLEAN DEFAULT TRUE,
        general_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql_settings);
    echo "✅ notification_settings table created successfully\n";
    
    // Insert default notification settings for existing users
    $sql_default_settings = "
    INSERT IGNORE INTO notification_settings (user_id)
    SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM notification_settings);
    ";
    
    $db->exec($sql_default_settings);
    echo "✅ Default notification settings created for existing users\n";
    
    echo "\n🎉 Notification system tables created successfully!\n";
    echo "You can now use the automated notification features.\n";
    
} catch (Exception $e) {
    echo "❌ Error creating notification tables: " . $e->getMessage() . "\n";
    exit(1);
}
?>