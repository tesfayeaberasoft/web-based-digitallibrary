-- Digital Library Management System Database Schema
-- Created for comprehensive library management with all required features

-- Users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'librarian', 'user', 'super-admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    google_id VARCHAR(100) NULL,
    INDEX idx_email (email),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- Direct messages are grouped into conversations by sender/receiver pair.
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    sender_role ENUM('user', 'librarian', 'admin', 'super-admin') NOT NULL,
    receiver_role ENUM('user', 'librarian', 'admin', 'super-admin') NOT NULL,
    message_content TEXT NOT NULL,
    status ENUM('read', 'unread') NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_sender_thread (sender_id, receiver_id, id),
    INDEX idx_messages_receiver_thread (receiver_id, sender_id, id),
    INDEX idx_messages_unread (receiver_id, status)
);

-- Categories table for book classification
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table with comprehensive book information
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    publication_year YEAR,
    category_id INT,
    description TEXT,
    cover_image VARCHAR(255),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    pages INT,
    language VARCHAR(50) DEFAULT 'English',
    file_path VARCHAR(255), -- For digital books (PDF, EPUB)
    file_type ENUM('pdf', 'epub', 'physical') DEFAULT 'physical',
    price DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    condition_status ENUM('new', 'good', 'fair', 'poor', 'damaged') NOT NULL DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_isbn (isbn),
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
);

-- Personal rich-text notes, stored as TipTap JSON documents
CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    note_content JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_notes_user_book (user_id, book_id),
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_notes_book (book_id)
);

-- Book loans/issues tracking
CREATE TABLE IF NOT EXISTS book_loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('active', 'returned', 'overdue', 'renewed') DEFAULT 'active',
    renewal_count INT DEFAULT 0,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    issued_by INT, -- librarian who issued the book
    returned_to INT, -- librarian who received the return
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (returned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_loan (user_id),
    INDEX idx_book_loan (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Book reservations with queue system
CREATE TABLE IF NOT EXISTS book_reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'available', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
    queue_position INT,
    expiry_date TIMESTAMP NULL,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_reservation (user_id),
    INDEX idx_book_reservation (book_id),
    INDEX idx_status (status),
    INDEX idx_queue (queue_position)
);

-- Fines management
CREATE TABLE IF NOT EXISTS fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    loan_id INT,
    fine_type ENUM('overdue', 'damage', 'lost', 'other') DEFAULT 'overdue',
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'paid', 'waived', 'partial') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'partial') DEFAULT 'unpaid',
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_at DATETIME NULL,
    payment_id INT NULL,
    payment_date TIMESTAMP NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES book_loans(id) ON DELETE SET NULL,
    INDEX idx_user_fine (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
);

-- Chapa fine payments
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
);

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
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('due_reminder', 'overdue_alert', 'reservation_available', 'fine_notice', 'general', 'payment_success') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    related_id INT, -- Can reference loan_id, reservation_id, etc.
    related_type VARCHAR(50), -- 'loan', 'reservation', 'fine', etc.
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notification (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
);

-- Per-user notification preferences
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Delivery history for in-app, email, and SMS notifications
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

-- Book reviews and ratings
CREATE TABLE IF NOT EXISTS book_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book_review (user_id, book_id),
    INDEX idx_book_review (book_id),
    INDEX idx_rating (rating)
);

-- User favorites / wishlist
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id),
    INDEX idx_user_favorites_book (book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Reading history and progress tracking
CREATE TABLE IF NOT EXISTS reading_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    start_date DATE,
    completion_date DATE,
    progress_percentage INT DEFAULT 0,
    reading_time_minutes INT DEFAULT 0,
    last_page_read INT DEFAULT 0,
    status ENUM('reading', 'completed', 'paused', 'abandoned') DEFAULT 'reading',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_history (user_id),
    INDEX idx_book_history (book_id),
    INDEX idx_status (status)
);

-- User achievements and gamification
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    criteria_type ENUM('books_read', 'reading_streak', 'reviews_written', 'time_spent') NOT NULL,
    criteria_value INT NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Reading goals
CREATE TABLE IF NOT EXISTS reading_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_type ENUM('yearly', 'monthly', 'weekly') NOT NULL,
    target_books INT NOT NULL,
    current_progress INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'failed', 'paused') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_goal (user_id),
    INDEX idx_status (status)
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit logs for security and accountability
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_audit (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Payment transactions (Chapa integration)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    purpose ENUM('fine_payment', 'book_rental', 'membership_fee') NOT NULL,
    related_id INT, -- fine_id, loan_id, etc.
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    chapa_transaction_id VARCHAR(100),
    callback_url VARCHAR(255),
    return_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_payment (user_id),
    INDEX idx_status (status),
    INDEX idx_reference (transaction_reference)
);

-- Library branches (for multi-library support)
CREATE TABLE IF NOT EXISTS library_branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Book copies per branch
CREATE TABLE IF NOT EXISTS book_branch_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    branch_id INT NOT NULL,
    total_copies INT DEFAULT 0,
    available_copies INT DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES library_branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_book_branch (book_id, branch_id)
);