-- Create comprehensive settings tables for the digital library system

-- Main system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (category, setting_key),
    INDEX idx_category (category),
    INDEX idx_key (setting_key)
);

-- Library information and policies
INSERT INTO system_settings (category, setting_key, setting_value, data_type, description) VALUES
-- Library Basic Information
('library_info', 'library_name', 'Digital Library Management System', 'string', 'Name of the library'),
('library_info', 'description', 'A comprehensive digital library management solution', 'string', 'Library description'),
('library_info', 'address', '123 Library Street, Education City', 'string', 'Library physical address'),
('library_info', 'phone', '+1 (555) 123-4567', 'string', 'Library contact phone'),
('library_info', 'email', 'info@digitallibrary.com', 'string', 'Library contact email'),
('library_info', 'website', 'https://digitallibrary.com', 'string', 'Library website URL'),

-- Library Policies (NEW)
('library_policies', 'max_user_borrow_books', '5', 'number', 'Maximum books a user can borrow simultaneously'),
('library_policies', 'due_fines_per_day', '0.50', 'number', 'Daily fine amount for overdue books (USD)'),
('library_policies', 'max_book_return_days', '14', 'number', 'Maximum days allowed for book return'),
('library_policies', 'max_reservations_per_user', '3', 'number', 'Maximum reservations per user'),
('library_policies', 'reservation_hold_days', '7', 'number', 'Days to hold reserved books'),
('library_policies', 'renewal_limit', '2', 'number', 'Maximum number of renewals allowed'),
('library_policies', 'grace_period_days', '3', 'number', 'Grace period before fines start'),

-- Operating Hours
('operating_hours', 'monday', '{"open":"08:00","close":"20:00","closed":false}', 'json', 'Monday operating hours'),
('operating_hours', 'tuesday', '{"open":"08:00","close":"20:00","closed":false}', 'json', 'Tuesday operating hours'),
('operating_hours', 'wednesday', '{"open":"08:00","close":"20:00","closed":false}', 'json', 'Wednesday operating hours'),
('operating_hours', 'thursday', '{"open":"08:00","close":"20:00","closed":false}', 'json', 'Thursday operating hours'),
('operating_hours', 'friday', '{"open":"08:00","close":"18:00","closed":false}', 'json', 'Friday operating hours'),
('operating_hours', 'saturday', '{"open":"09:00","close":"17:00","closed":false}', 'json', 'Saturday operating hours'),
('operating_hours', 'sunday', '{"open":"10:00","close":"16:00","closed":false}', 'json', 'Sunday operating hours'),

-- Social Media
('social_media', 'facebook', 'https://facebook.com/digitallibrary', 'string', 'Facebook page URL'),
('social_media', 'twitter', 'https://twitter.com/digitallibrary', 'string', 'Twitter profile URL'),
('social_media', 'instagram', 'https://instagram.com/digitallibrary', 'string', 'Instagram profile URL'),
('social_media', 'linkedin', 'https://linkedin.com/company/digitallibrary', 'string', 'LinkedIn company URL'),

-- System Configuration
('system_config', 'allow_registration', 'true', 'boolean', 'Allow new user registration'),
('system_config', 'require_email_verification', 'true', 'boolean', 'Require email verification for new users'),
('system_config', 'session_timeout', '60', 'number', 'Session timeout in minutes'),
('system_config', 'password_min_length', '6', 'number', 'Minimum password length'),
('system_config', 'password_require_special', 'false', 'boolean', 'Require special characters in password'),
('system_config', 'two_factor_auth', 'false', 'boolean', 'Enable two-factor authentication'),
('system_config', 'maintenance_mode', 'false', 'boolean', 'System maintenance mode'),
('system_config', 'auto_renewal', 'true', 'boolean', 'Enable automatic book renewal'),

-- Notification Settings
('notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications'),
('notifications', 'sms_enabled', 'false', 'boolean', 'Enable SMS notifications'),
('notifications', 'push_enabled', 'true', 'boolean', 'Enable push notifications'),
('notifications', 'overdue_reminders', 'true', 'boolean', 'Send overdue book reminders'),
('notifications', 'reservation_alerts', 'true', 'boolean', 'Send reservation alerts'),
('notifications', 'new_book_notifications', 'true', 'boolean', 'Send new book notifications'),
('notifications', 'system_alerts', 'true', 'boolean', 'Send system alerts'),
('notifications', 'overdue_check_time', '09:00', 'string', 'Time to check for overdue books'),
('notifications', 'reservation_check_time', '10:00', 'string', 'Time to check reservations'),
('notifications', 'daily_report_time', '18:00', 'string', 'Time to send daily reports'),

-- Email Templates
('email_templates', 'welcome', 'Welcome to our Digital Library!', 'string', 'Welcome email template'),
('email_templates', 'overdue', 'You have overdue books. Please return them.', 'string', 'Overdue notice template'),
('email_templates', 'reservation', 'Your reserved book is now available.', 'string', 'Reservation ready template'),
('email_templates', 'renewal', 'Your book loan has been renewed.', 'string', 'Renewal confirmation template'),

-- Security Settings
('security', 'login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('security', 'lockout_duration', '30', 'number', 'Account lockout duration in minutes'),
('security', 'password_expiry', '90', 'number', 'Password expiry in days'),
('security', 'session_security', 'true', 'boolean', 'Enhanced session security'),
('security', 'audit_logging', 'true', 'boolean', 'Enable audit logging'),
('security', 'data_encryption', 'true', 'boolean', 'Enable data encryption'),
('security', 'cors_enabled', 'true', 'boolean', 'Enable CORS'),
('security', 'https_only', 'true', 'boolean', 'Require HTTPS only'),
('security', 'backup_frequency', 'daily', 'string', 'Backup frequency'),
('security', 'backup_retention', '30', 'number', 'Backup retention in days'),
('security', 'api_rate_limit', '100', 'number', 'API rate limit per minute'),

-- Appearance Settings
('appearance', 'theme', 'light', 'string', 'System theme (light/dark/auto)'),
('appearance', 'primary_color', '#4a9b8e', 'string', 'Primary theme color'),
('appearance', 'secondary_color', '#66bb6a', 'string', 'Secondary theme color'),
('appearance', 'show_branding', 'true', 'boolean', 'Show library branding'),
('appearance', 'compact_mode', 'false', 'boolean', 'Enable compact mode'),
('appearance', 'animations_enabled', 'true', 'boolean', 'Enable animations'),
('appearance', 'custom_css', '', 'string', 'Custom CSS styles');

-- Settings change log table
CREATE TABLE IF NOT EXISTS settings_changelog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INT,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_key (category, setting_key),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- System maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    status ENUM('started', 'completed', 'failed') DEFAULT 'started',
    performed_by INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    result_data JSON,
    INDEX idx_action (action),
    INDEX idx_status (status),
    INDEX idx_performed_by (performed_by),
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- System status monitoring table
CREATE TABLE IF NOT EXISTS system_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    status ENUM('healthy', 'warning', 'critical') DEFAULT 'healthy',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_status (status),
    INDEX idx_recorded_at (recorded_at)
);

-- Insert initial system status metrics
INSERT INTO system_status (metric_name, metric_value, metric_unit, status) VALUES
('cpu_usage', 23.5, 'percent', 'healthy'),
('memory_usage', 65.2, 'percent', 'healthy'),
('storage_usage', 78.1, 'percent', 'warning'),
('database_response_time', 45.0, 'milliseconds', 'healthy'),
('active_users', 142, 'count', 'healthy'),
('total_books', 15847, 'count', 'healthy'),
('active_loans', 892, 'count', 'healthy'),
('overdue_books', 23, 'count', 'warning');

-- Create indexes for better performance
CREATE INDEX idx_settings_category ON system_settings(category);
CREATE INDEX idx_settings_updated ON system_settings(updated_at);
CREATE INDEX idx_changelog_date ON settings_changelog(created_at);
CREATE INDEX idx_maintenance_date ON maintenance_log(started_at);
CREATE INDEX idx_status_date ON system_status(recorded_at);