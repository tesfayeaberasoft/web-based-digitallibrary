CREATE TABLE IF NOT EXISTS notification_settings (
    user_id INT PRIMARY KEY,
    email_enabled TINYINT(1) NOT NULL DEFAULT 1,
    sms_enabled TINYINT(1) NOT NULL DEFAULT 0,
    push_enabled TINYINT(1) NOT NULL DEFAULT 1,
    due_reminder_days VARCHAR(100) NOT NULL DEFAULT '[3, 1]',
    overdue_reminder_days VARCHAR(100) NOT NULL DEFAULT '[1, 3, 7]',
    reservation_notifications TINYINT(1) NOT NULL DEFAULT 1,
    fine_notifications TINYINT(1) NOT NULL DEFAULT 1,
    general_notifications TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_settings_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
