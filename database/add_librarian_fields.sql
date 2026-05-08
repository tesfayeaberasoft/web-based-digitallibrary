-- Add librarian-specific fields to users table
-- This script adds additional columns to support librarian management features

USE digital_library;

-- Add librarian-specific columns to users table
ALTER TABLE users 
ADD COLUMN employee_id VARCHAR(50) NULL AFTER user_id,
ADD COLUMN department VARCHAR(100) NULL AFTER address,
ADD COLUMN hire_date DATE NULL AFTER department,
ADD COLUMN shift ENUM('morning', 'afternoon', 'evening', 'night', 'flexible') DEFAULT 'morning' AFTER hire_date,
ADD COLUMN suspension_reason TEXT NULL AFTER status,
ADD COLUMN permissions JSON NULL AFTER suspension_reason;

-- Add indexes for better performance
ALTER TABLE users 
ADD INDEX idx_employee_id (employee_id),
ADD INDEX idx_department (department),
ADD INDEX idx_shift (shift);

-- Update existing librarians with default values
UPDATE users 
SET 
    employee_id = CONCAT('LIB', LPAD(id, 4, '0')),
    department = 'General',
    hire_date = created_at,
    shift = 'morning'
WHERE role = 'librarian' AND employee_id IS NULL;

-- Create librarian_performance table for tracking performance metrics
CREATE TABLE IF NOT EXISTS librarian_performance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    librarian_id INT NOT NULL,
    books_processed INT DEFAULT 0,
    users_assisted INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    performance_score DECIMAL(3,2) DEFAULT 0.00,
    month TINYINT NOT NULL,
    year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (librarian_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_librarian_month (librarian_id, month, year),
    INDEX idx_librarian_performance (librarian_id),
    INDEX idx_month_year (month, year)
);

-- Create librarian_schedules table for shift management
CREATE TABLE IF NOT EXISTS librarian_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    librarian_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (librarian_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_librarian_schedule (librarian_id),
    INDEX idx_day_of_week (day_of_week)
);

-- Insert default schedules for existing librarians
INSERT INTO librarian_schedules (librarian_id, day_of_week, start_time, end_time)
SELECT 
    id as librarian_id,
    day_num as day_of_week,
    CASE 
        WHEN shift = 'morning' THEN '08:00:00'
        WHEN shift = 'afternoon' THEN '12:00:00'
        WHEN shift = 'evening' THEN '16:00:00'
        WHEN shift = 'night' THEN '22:00:00'
        ELSE '08:00:00'
    END as start_time,
    CASE 
        WHEN shift = 'morning' THEN '16:00:00'
        WHEN shift = 'afternoon' THEN '20:00:00'
        WHEN shift = 'evening' THEN '00:00:00'
        WHEN shift = 'night' THEN '06:00:00'
        ELSE '16:00:00'
    END as end_time
FROM users 
CROSS JOIN (
    SELECT 1 as day_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) days
WHERE role = 'librarian'
ON DUPLICATE KEY UPDATE start_time = VALUES(start_time);

-- Create librarian_tasks table for task assignment and tracking
CREATE TABLE IF NOT EXISTS librarian_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    librarian_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_by INT,
    due_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (librarian_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_librarian_tasks (librarian_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date)
);

-- Insert sample performance data for existing librarians
INSERT INTO librarian_performance (librarian_id, books_processed, users_assisted, tasks_completed, performance_score, month, year)
SELECT 
    id as librarian_id,
    FLOOR(RAND() * 50) + 20 as books_processed,
    FLOOR(RAND() * 30) + 10 as users_assisted,
    FLOOR(RAND() * 20) + 5 as tasks_completed,
    ROUND(3.5 + (RAND() * 1.5), 2) as performance_score,
    MONTH(CURRENT_DATE) as month,
    YEAR(CURRENT_DATE) as year
FROM users 
WHERE role = 'librarian'
ON DUPLICATE KEY UPDATE 
    books_processed = VALUES(books_processed),
    users_assisted = VALUES(users_assisted);

-- Create view for librarian dashboard statistics
CREATE OR REPLACE VIEW librarian_stats AS
SELECT 
    u.id,
    u.full_name,
    u.employee_id,
    u.department,
    u.shift,
    u.status,
    u.hire_date,
    COALESCE(lp.books_processed, 0) as books_processed,
    COALESCE(lp.users_assisted, 0) as users_assisted,
    COALESCE(lp.tasks_completed, 0) as tasks_completed,
    COALESCE(lp.performance_score, 0.00) as performance_score,
    (SELECT COUNT(*) FROM librarian_tasks lt WHERE lt.librarian_id = u.id AND lt.status = 'pending') as pending_tasks,
    (SELECT COUNT(*) FROM book_loans bl WHERE bl.issued_by = u.id AND DATE(bl.created_at) = CURRENT_DATE) as books_issued_today
FROM users u
LEFT JOIN librarian_performance lp ON u.id = lp.librarian_id 
    AND lp.month = MONTH(CURRENT_DATE) 
    AND lp.year = YEAR(CURRENT_DATE)
WHERE u.role = 'librarian';

-- Add some sample librarian tasks
INSERT INTO librarian_tasks (librarian_id, title, description, priority, status, due_date)
SELECT 
    id as librarian_id,
    'Monthly Inventory Check' as title,
    'Conduct monthly inventory check for assigned section' as description,
    'medium' as priority,
    'pending' as status,
    DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) as due_date
FROM users 
WHERE role = 'librarian'
LIMIT 3;

INSERT INTO librarian_tasks (librarian_id, title, description, priority, status, due_date)
SELECT 
    id as librarian_id,
    'Update Book Catalog' as title,
    'Update digital catalog with new book arrivals' as description,
    'high' as priority,
    'pending' as status,
    DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY) as due_date
FROM users 
WHERE role = 'librarian'
LIMIT 2;

-- Update user update permissions for librarian fields
-- This ensures the backend API can handle the new fields
SHOW COLUMNS FROM users;