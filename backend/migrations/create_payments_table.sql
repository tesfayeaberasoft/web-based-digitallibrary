-- ============================================================================
-- CHAPA PAYMENT GATEWAY INTEGRATION - DATABASE SCHEMA
-- ============================================================================
-- This migration creates the payments table for tracking Chapa transactions
-- for overdue book fines in the Digital Library Management System
-- ============================================================================

-- Create payments table for Chapa transactions
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Transaction identification
    tx_ref VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique transaction reference for Chapa',
    
    -- User and fine details
    user_id INT NOT NULL,
    fine_id INT NOT NULL COMMENT 'Reference to the fine being paid',
    
    -- Payment amount
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount',
    currency VARCHAR(3) DEFAULT 'ETB' COMMENT 'Currency code (ETB, USD, etc.)',
    
    -- Payment status tracking
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    
    -- Chapa response data
    chapa_reference VARCHAR(100) NULL COMMENT 'Chapa internal reference',
    checkout_url TEXT NULL COMMENT 'Chapa checkout URL',
    
    -- Verification data
    verified_at DATETIME NULL COMMENT 'When payment was verified',
    chapa_response JSON NULL COMMENT 'Full Chapa API response for audit',
    
    -- Customer information (from Chapa)
    customer_email VARCHAR(255) NULL,
    customer_phone VARCHAR(20) NULL,
    customer_name VARCHAR(255) NULL,
    
    -- Payment method used
    payment_method VARCHAR(50) NULL COMMENT 'telebirr, cbebirr, ebirr, etc.',
    
    -- Metadata
    callback_attempts INT DEFAULT 0 COMMENT 'Number of callback verification attempts',
    last_callback_at DATETIME NULL COMMENT 'Last callback timestamp',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_fine_id (fine_id),
    INDEX idx_tx_ref (tx_ref),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Update fines table to add payment tracking
-- ============================================================================

-- Add payment_status column to fines table if it doesn't exist
ALTER TABLE fines 
ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'paid', 'partial') DEFAULT 'unpaid' AFTER amount,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER payment_status,
ADD COLUMN IF NOT EXISTS paid_at DATETIME NULL AFTER paid_amount,
ADD COLUMN IF NOT EXISTS payment_id INT NULL COMMENT 'Reference to successful payment' AFTER paid_at,
ADD FOREIGN KEY IF NOT EXISTS fk_fines_payment (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Add index for payment_status queries
ALTER TABLE fines 
ADD INDEX IF NOT EXISTS idx_payment_status (payment_status);

-- ============================================================================
-- Create payment_logs table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    tx_ref VARCHAR(100) NOT NULL,
    
    -- Log details
    event_type ENUM('initialization', 'callback', 'verification', 'status_change', 'error') NOT NULL,
    status_before VARCHAR(50) NULL,
    status_after VARCHAR(50) NULL,
    
    -- Request/Response data
    request_data JSON NULL COMMENT 'API request payload',
    response_data JSON NULL COMMENT 'API response payload',
    error_message TEXT NULL,
    
    -- Source tracking
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_payment_id (payment_id),
    INDEX idx_tx_ref (tx_ref),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Create stored procedure to calculate total unpaid fines for a user
-- ============================================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GetUserUnpaidFines(IN userId INT)
BEGIN
    SELECT 
        f.id,
        f.user_id,
        f.loan_id,
        f.amount,
        f.payment_status,
        f.paid_amount,
        f.reason,
        f.due_date,
        f.created_at,
        l.book_id,
        b.title AS book_title,
        b.isbn,
        (f.amount - f.paid_amount) AS balance
    FROM fines f
    LEFT JOIN loans l ON f.loan_id = l.id
    LEFT JOIN books b ON l.book_id = b.id
    WHERE f.user_id = userId 
    AND f.payment_status != 'paid'
    ORDER BY f.created_at DESC;
END$$

DELIMITER ;

-- ============================================================================
-- Create trigger to update user borrowing status when fine is paid
-- ============================================================================

DELIMITER $$

CREATE TRIGGER IF NOT EXISTS after_fine_payment
AFTER UPDATE ON fines
FOR EACH ROW
BEGIN
    -- If fine status changed from unpaid to paid
    IF OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
        -- Check if user has any remaining unpaid fines
        SET @unpaid_count = (
            SELECT COUNT(*) 
            FROM fines 
            WHERE user_id = NEW.user_id 
            AND payment_status != 'paid'
        );
        
        -- If no unpaid fines, update user status to active
        IF @unpaid_count = 0 THEN
            UPDATE users 
            SET status = 'active',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.user_id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- Insert sample configuration data
-- ============================================================================

-- Create payment_settings table for Chapa configuration
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default payment settings
INSERT INTO payment_settings (setting_key, setting_value, description) VALUES
('chapa_enabled', 'true', 'Enable/disable Chapa payment gateway'),
('chapa_test_mode', 'true', 'Use test API keys (sandbox mode)'),
('chapa_currency', 'ETB', 'Default currency for transactions'),
('fine_per_day', '5.00', 'Fine amount per day overdue'),
('payment_callback_url', 'http://localhost:8000/api/payments/callback', 'Chapa callback URL'),
('payment_return_url', 'http://localhost:3000/dashboard', 'User return URL after payment')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Verification: Show table structure
-- ============================================================================

SHOW CREATE TABLE payments;
SHOW CREATE TABLE payment_logs;
SHOW CREATE TABLE payment_settings;
DESCRIBE fines;
