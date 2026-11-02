-- One-time upgrade for a database imported from the earlier schema.sql.
-- Select the target database in phpMyAdmin before importing this file.
-- Do not run this if the `payments` table or these `fines` columns already exist.

ALTER TABLE fines
    ADD COLUMN payment_status ENUM('unpaid', 'paid', 'partial') NOT NULL DEFAULT 'unpaid' AFTER status,
    ADD COLUMN paid_at DATETIME NULL AFTER paid_amount,
    ADD COLUMN payment_id INT NULL AFTER paid_at;

CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tx_ref VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    fine_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    chapa_reference VARCHAR(100) NULL,
    checkout_url TEXT NULL,
    verified_at DATETIME NULL,
    chapa_response JSON NULL,
    customer_email VARCHAR(255) NULL,
    customer_phone VARCHAR(20) NULL,
    customer_name VARCHAR(255) NULL,
    payment_method VARCHAR(50) NULL,
    callback_attempts INT DEFAULT 0,
    last_callback_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_fine_id (fine_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    tx_ref VARCHAR(100) NOT NULL,
    event_type ENUM('initialization', 'callback', 'verification', 'status_change', 'error') NOT NULL,
    status_before VARCHAR(50) NULL,
    status_after VARCHAR(50) NULL,
    request_data JSON NULL,
    response_data JSON NULL,
    error_message TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_logs_tx_ref (tx_ref),
    INDEX idx_payment_logs_event_type (event_type),
    INDEX idx_payment_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
