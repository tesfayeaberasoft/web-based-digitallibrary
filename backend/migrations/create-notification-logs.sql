CREATE TABLE IF NOT EXISTS notification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    type VARCHAR(30) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT NULL,
    related_id INT NULL,
    related_type VARCHAR(50) NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_log_user (user_id),
    INDEX idx_notification_log_type (type),
    INDEX idx_notification_log_status (status),
    INDEX idx_notification_log_sent_at (sent_at)
);
