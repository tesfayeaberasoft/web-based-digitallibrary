-- Sample data for Digital Library Management System.
-- Safe to import more than once. Existing user accounts are not overwritten,
-- and related records use email addresses, ISBNs, and names instead of fixed IDs.
-- Demo accounts created here use the password: DemoLibrary2026!
USE digital_library;
SET NAMES utf8mb4;

-- Insert default system settings without replacing values already configured.
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('library_name', 'Digital Library Management System', 'Name of the library'),
('max_borrow_days', '30', 'Maximum number of days a book can be borrowed'),
('max_books_per_user', '5', 'Maximum number of books a user can borrow at once'),
('fine_per_day', '0.50', 'Fine amount per day for overdue books'),
('reservation_expiry_days', '3', 'Number of days a reservation remains valid'),
('max_renewal_count', '2', 'Maximum number of times a book can be renewed'),
('notification_email', 'library@example.com', 'Email address for system notifications');

-- Insert default categories without duplicating existing category names.
INSERT IGNORE INTO categories (name, description, color_code) VALUES
('Fiction', 'Fictional literature including novels and short stories', '#9b59b6'),
('Science', 'Scientific books and research materials', '#3498db'),
('Academic', 'Academic textbooks and educational materials', '#e74c3c'),
('History', 'Historical books and documentaries', '#f39c12'),
('Technology', 'Technology, programming, and computer science books', '#2ecc71'),
('Arts', 'Art, music, and creative literature', '#e91e63'),
('Romance', 'Romance novels and love stories', '#ff6b9d'),
('Journals', 'Academic journals and periodicals', '#34495e'),
('Photography', 'Photography books and visual arts', '#fd79a8'),
('Music', 'Music theory, history, and biographies', '#6c5ce7'),
('Gaming', 'Gaming guides and industry books', '#a29bfe'),
('Business', 'Business, economics, and management books', '#00b894');

-- Seed staff accounts for a fresh database. Existing accounts are left intact.
INSERT IGNORE INTO users (user_id, full_name, email, phone, address, password_hash, role, status) VALUES
('ADMIN001', 'System Administrator', 'admin@digitallibrary.com', NULL, NULL, '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'admin', 'active'),
('SUPER001', 'Super Administrator', 'superadmin@digitallibrary.com', NULL, NULL, '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'super-admin', 'active'),
('LIB001', 'Sarah Johnson', 'sarah@library.com', '+1-555-0101', '123 Library St, City, State', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'librarian', 'active'),
('LIB002', 'Michael Chen', 'michael@library.com', '+1-555-0102', '456 Book Ave, City, State', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'librarian', 'active'),
('LIB003', 'Emily Davis', 'emily@library.com', '+1-555-0103', '789 Reading Rd, City, State', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'librarian', 'inactive');

-- Repair only the original placeholder password on these known demo accounts.
-- Any password changed by an administrator is preserved.
UPDATE users
SET password_hash = '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i'
WHERE email IN (
    'admin@digitallibrary.com',
    'superadmin@digitallibrary.com',
    'sarah@library.com',
    'michael@library.com',
    'emily@library.com'
)
AND password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Dedicated demo members avoid collisions with registered USR### accounts.
INSERT IGNORE INTO users (user_id, full_name, email, phone, address, password_hash, role, status) VALUES
('DEMO001', 'John Doe', 'john.doe@example.com', '+1-555-1234', '123 Main St, City, State 12345', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'user', 'active'),
('DEMO002', 'Jane Smith', 'jane.smith@example.com', '+1-555-5678', '456 Oak Ave, City, State 12345', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'user', 'active'),
('DEMO003', 'Bob Johnson', 'bob.johnson@example.com', '+1-555-9012', '789 Pine St, City, State 12345', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'user', 'active'),
('DEMO004', 'Alice Brown', 'alice.brown@example.com', '+1-555-3456', '321 Elm St, City, State 12345', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'user', 'active'),
('DEMO005', 'Charlie Wilson', 'charlie.wilson@example.com', '+1-555-7890', '654 Maple Ave, City, State 12345', '$2y$10$mT8xJWnaj.KCZqMR8Wqp/uugK.hQ92iKcAg3x1YZTnhp8ma5igI.i', 'user', 'active');

-- Insert books by category name so category IDs need not match a fixed sequence.
INSERT IGNORE INTO books
    (isbn, title, author, publisher, publication_year, category_id, description,
     total_copies, available_copies, pages, language, price)
SELECT seed.isbn, seed.title, seed.author, seed.publisher, seed.publication_year,
       categories.id, seed.description, seed.total_copies, seed.available_copies,
       seed.pages, 'English', seed.price
FROM (
    SELECT '978-0-7432-7356-5' AS isbn, 'The Great Gatsby' AS title, 'F. Scott Fitzgerald' AS author, 'Scribner' AS publisher, 1925 AS publication_year, 'Fiction' AS category_name, 'A classic American novel set in the Jazz Age' AS description, 5 AS total_copies, 3 AS available_copies, 180 AS pages, 15.99 AS price
    UNION ALL SELECT '978-0-452-28423-4', '1984', 'George Orwell', 'Penguin Books', 1949, 'Fiction', 'A dystopian social science fiction novel', 8, 7, 328, 13.99
    UNION ALL SELECT '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 'Fiction', 'A novel about racial injustice and childhood in the American South', 6, 5, 376, 14.99
    UNION ALL SELECT '978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 1813, 'Romance', 'A romantic novel of manners', 4, 3, 432, 12.99
    UNION ALL SELECT '978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 'Fiction', 'A controversial novel about teenage rebellion', 3, 3, 277, 16.99
    UNION ALL SELECT '978-0-06-085052-4', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', 1932, 'Science', 'A dystopian novel about a technologically advanced future society', 5, 5, 311, 15.49
    UNION ALL SELECT '978-0-7432-7357-2', 'Moby Dick', 'Herman Melville', 'Scribner', 1851, 'Fiction', 'The epic tale of Captain Ahab and the white whale', 3, 3, 635, 18.99
    UNION ALL SELECT '978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', 1937, 'Fiction', 'A fantasy adventure novel', 7, 7, 310, 14.99
) AS seed
JOIN categories ON categories.name = seed.category_name;

-- Correct copy counts created by the original sample seed so they agree with
-- its loan records. The guards keep later inventory edits intact.
UPDATE books SET available_copies = 7
WHERE isbn = '978-0-452-28423-4' AND total_copies = 8 AND available_copies = 2;
UPDATE books SET available_copies = 5
WHERE isbn = '978-0-06-112008-4' AND total_copies = 6 AND available_copies = 4;
UPDATE books SET available_copies = 3
WHERE isbn = '978-0-14-243724-7' AND total_copies = 4 AND available_copies = 4;
UPDATE books SET available_copies = 7
WHERE isbn = '978-0-06-112009-1' AND total_copies = 7 AND available_copies = 6;

-- Loans use actual member, book, and librarian IDs and dates relative to import time.
INSERT INTO book_loans (user_id, book_id, loan_date, due_date, status, issued_by)
SELECT members.id, books.id, seed.loan_date, seed.due_date, seed.status, staff.id
FROM (
    SELECT 'john.doe@example.com' AS member_email, '978-0-7432-7356-5' AS isbn, DATE_SUB(CURDATE(), INTERVAL 10 DAY) AS loan_date, DATE_ADD(CURDATE(), INTERVAL 20 DAY) AS due_date, 'active' AS status, 'sarah@library.com' AS staff_email
    UNION ALL SELECT 'jane.smith@example.com', '978-0-452-28423-4', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'active', 'sarah@library.com'
    UNION ALL SELECT 'bob.johnson@example.com', '978-0-06-112008-4', DATE_SUB(CURDATE(), INTERVAL 50 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'overdue', 'sarah@library.com'
    UNION ALL SELECT 'alice.brown@example.com', '978-0-7432-7356-5', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_ADD(CURDATE(), INTERVAL 26 DAY), 'active', 'michael@library.com'
    UNION ALL SELECT 'charlie.wilson@example.com', '978-0-14-243724-7', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'active', 'michael@library.com'
) AS seed
JOIN users AS members ON members.email = seed.member_email
JOIN books ON books.isbn = seed.isbn
LEFT JOIN users AS staff ON staff.email = seed.staff_email
WHERE NOT EXISTS (
    SELECT 1 FROM book_loans AS existing
    WHERE existing.user_id = members.id
      AND existing.book_id = books.id
      AND existing.loan_date = seed.loan_date
);

-- Insert sample reservations once per member and book.
INSERT INTO book_reservations (user_id, book_id, queue_position, status)
SELECT members.id, books.id, seed.queue_position, 'pending'
FROM (
    SELECT 'charlie.wilson@example.com' AS member_email, '978-0-452-28423-4' AS isbn, 1 AS queue_position
    UNION ALL SELECT 'john.doe@example.com', '978-0-06-112009-1', 2
) AS seed
JOIN users AS members ON members.email = seed.member_email
JOIN books ON books.isbn = seed.isbn
WHERE NOT EXISTS (
    SELECT 1 FROM book_reservations AS existing
    WHERE existing.user_id = members.id AND existing.book_id = books.id
);

-- Insert sample fines without duplicating an existing fine.
INSERT INTO fines (user_id, loan_id, fine_type, amount, description, status, payment_status, paid_amount, paid_at)
SELECT members.id, loans.id, seed.fine_type, seed.amount, seed.description,
       seed.status, seed.payment_status, seed.paid_amount, seed.paid_at
FROM (
    SELECT 'bob.johnson@example.com' AS member_email, '978-0-06-112008-4' AS isbn, 'overdue' AS fine_type, 15.00 AS amount, 'Sample overdue fine' AS description, 'pending' AS status, 'unpaid' AS payment_status, 0.00 AS paid_amount, NULL AS paid_at
    UNION ALL SELECT 'alice.brown@example.com', NULL, 'damage', 25.00, 'Sample fine for a damaged book', 'paid', 'paid', 25.00, NOW()
) AS seed
JOIN users AS members ON members.email = seed.member_email
LEFT JOIN books ON books.isbn = seed.isbn
LEFT JOIN book_loans AS loans
    ON loans.user_id = members.id AND loans.book_id = books.id AND loans.status = 'overdue'
WHERE NOT EXISTS (
    SELECT 1 FROM fines AS existing
    WHERE existing.user_id = members.id
      AND existing.fine_type = seed.fine_type
      AND existing.description = seed.description
);

-- Notifications are looked up by their sample title and member.
INSERT INTO notifications (user_id, type, title, message)
SELECT members.id, seed.type, seed.title, seed.message
FROM (
    SELECT 'john.doe@example.com' AS member_email, 'due_reminder' AS type, 'Sample: Book Due Soon' AS title, 'Your loan for The Great Gatsby is due soon.' AS message
    UNION ALL SELECT 'charlie.wilson@example.com', 'reservation_available', 'Sample: Reservation Confirmed', 'Your reservation for 1984 is in the queue.'
    UNION ALL SELECT 'bob.johnson@example.com', 'overdue_alert', 'Sample: Overdue Book', 'Your loan for To Kill a Mockingbird is overdue.'
    UNION ALL SELECT 'alice.brown@example.com', 'general', 'Sample: New Books Available', 'New books have been added to the library catalog.'
) AS seed
JOIN users AS members ON members.email = seed.member_email
WHERE NOT EXISTS (
    SELECT 1 FROM notifications AS existing
    WHERE existing.user_id = members.id AND existing.title = seed.title
);

-- Insert sample reviews; the schema enforces one review per member and book.
INSERT IGNORE INTO book_reviews (user_id, book_id, rating, review_text)
SELECT members.id, books.id, seed.rating, seed.review_text
FROM (
    SELECT 'john.doe@example.com' AS member_email, '978-0-7432-7356-5' AS isbn, 5 AS rating, 'An absolutely brilliant novel with mesmerizing writing.' AS review_text
    UNION ALL SELECT 'jane.smith@example.com', '978-0-452-28423-4', 4, 'A thought-provoking dystopian masterpiece.'
    UNION ALL SELECT 'bob.johnson@example.com', '978-0-06-112008-4', 5, 'A timeless and powerful classic.'
    UNION ALL SELECT 'charlie.wilson@example.com', '978-0-14-243724-7', 4, 'Witty and full of memorable characters.'
    UNION ALL SELECT 'alice.brown@example.com', '978-0-06-085052-4', 5, 'A fascinating and unsettling vision of the future.'
) AS seed
JOIN users AS members ON members.email = seed.member_email
JOIN books ON books.isbn = seed.isbn;

-- Insert sample reading history once per member and book.
INSERT INTO reading_history (user_id, book_id, start_date, completion_date, progress_percentage, status)
SELECT members.id, books.id, seed.start_date, seed.completion_date, seed.progress_percentage, seed.status
FROM (
    SELECT 'john.doe@example.com' AS member_email, '978-0-7432-4722-4' AS isbn, DATE_SUB(CURDATE(), INTERVAL 40 DAY) AS start_date, DATE_SUB(CURDATE(), INTERVAL 32 DAY) AS completion_date, 100 AS progress_percentage, 'completed' AS status
    UNION ALL SELECT 'john.doe@example.com', '978-0-06-085052-4', DATE_SUB(CURDATE(), INTERVAL 20 DAY), NULL, 65, 'reading'
    UNION ALL SELECT 'jane.smith@example.com', '978-0-7432-7357-2', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), 100, 'completed'
    UNION ALL SELECT 'bob.johnson@example.com', '978-0-06-112009-1', DATE_SUB(CURDATE(), INTERVAL 10 DAY), NULL, 30, 'reading'
) AS seed
JOIN users AS members ON members.email = seed.member_email
JOIN books ON books.isbn = seed.isbn
WHERE NOT EXISTS (
    SELECT 1 FROM reading_history AS existing
    WHERE existing.user_id = members.id AND existing.book_id = books.id
);

-- Insert sample achievements by name, then award them by member email.
INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, points)
SELECT seed.name, seed.description, seed.icon, seed.criteria_type, seed.criteria_value, seed.points
FROM (
    SELECT 'Bookworm' AS name, 'Read 10 books' AS description, 'book-icon' AS icon, 'books_read' AS criteria_type, 10 AS criteria_value, 100 AS points
    UNION ALL SELECT 'Speed Reader', 'Finish 5 books in a month', 'speed-icon', 'books_read', 5, 150
    UNION ALL SELECT 'Diverse Reader', 'Read from 5 different categories', 'diversity-icon', 'books_read', 5, 200
    UNION ALL SELECT 'Reviewer', 'Write 20 reviews', 'review-icon', 'reviews_written', 20, 75
) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM achievements AS existing WHERE existing.name = seed.name
);

INSERT IGNORE INTO user_achievements (user_id, achievement_id)
SELECT members.id, achievements.id
FROM (
    SELECT 'john.doe@example.com' AS member_email, 'Bookworm' AS achievement_name
    UNION ALL SELECT 'john.doe@example.com', 'Reviewer'
    UNION ALL SELECT 'jane.smith@example.com', 'Speed Reader'
) AS seed
JOIN users AS members ON members.email = seed.member_email
JOIN achievements ON achievements.name = seed.achievement_name;

-- Insert sample reading goals for the current year and month.
INSERT INTO reading_goals (user_id, goal_type, target_books, current_progress, start_date, end_date)
SELECT members.id, seed.goal_type, seed.target_books, seed.current_progress, seed.start_date, seed.end_date
FROM (
    SELECT 'john.doe@example.com' AS member_email, 'yearly' AS goal_type, 50 AS target_books, 8 AS current_progress, MAKEDATE(YEAR(CURDATE()), 1) AS start_date, DATE_SUB(DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL 1 YEAR), INTERVAL 1 DAY) AS end_date
    UNION ALL SELECT 'john.doe@example.com', 'monthly', 5, 2, DATE_SUB(CURDATE(), INTERVAL DAYOFMONTH(CURDATE()) - 1 DAY), LAST_DAY(CURDATE())
    UNION ALL SELECT 'jane.smith@example.com', 'yearly', 24, 6, MAKEDATE(YEAR(CURDATE()), 1), DATE_SUB(DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL 1 YEAR), INTERVAL 1 DAY)
) AS seed
JOIN users AS members ON members.email = seed.member_email
WHERE NOT EXISTS (
    SELECT 1 FROM reading_goals AS existing
    WHERE existing.user_id = members.id
      AND existing.goal_type = seed.goal_type
      AND existing.start_date = seed.start_date
);

-- Insert library branches once, associating managers by email.
INSERT INTO library_branches (name, address, phone, email, manager_id)
SELECT seed.name, seed.address, seed.phone, seed.email, managers.id
FROM (
    SELECT 'Main Library' AS name, '123 Library Street, Downtown, City 12345' AS address, '+1-555-LIBRARY' AS phone, 'main@digitallibrary.com' AS email, 'sarah@library.com' AS manager_email
    UNION ALL SELECT 'North Branch', '456 North Ave, Northside, City 12346', '+1-555-NORTH', 'north@digitallibrary.com', 'michael@library.com'
) AS seed
LEFT JOIN users AS managers ON managers.email = seed.manager_email
WHERE NOT EXISTS (
    SELECT 1 FROM library_branches AS existing WHERE existing.name = seed.name
);

-- Branch inventory uses ISBN and branch name rather than assumed numeric IDs.
INSERT INTO book_branch_inventory (book_id, branch_id, total_copies, available_copies)
SELECT books.id, branches.id, seed.total_copies, seed.available_copies
FROM (
    SELECT '978-0-7432-7356-5' AS isbn, 'Main Library' AS branch_name, 3 AS total_copies, 1 AS available_copies
    UNION ALL SELECT '978-0-7432-7356-5', 'North Branch', 2, 2
    UNION ALL SELECT '978-0-452-28423-4', 'Main Library', 5, 4
    UNION ALL SELECT '978-0-452-28423-4', 'North Branch', 3, 3
    UNION ALL SELECT '978-0-06-112008-4', 'Main Library', 4, 3
    UNION ALL SELECT '978-0-06-112008-4', 'North Branch', 2, 2
    UNION ALL SELECT '978-0-14-243724-7', 'Main Library', 4, 3
    UNION ALL SELECT '978-0-7432-4722-4', 'Main Library', 3, 3
    UNION ALL SELECT '978-0-06-085052-4', 'Main Library', 3, 3
    UNION ALL SELECT '978-0-06-085052-4', 'North Branch', 2, 2
    UNION ALL SELECT '978-0-7432-7357-2', 'Main Library', 2, 2
    UNION ALL SELECT '978-0-7432-7357-2', 'North Branch', 1, 1
    UNION ALL SELECT '978-0-06-112009-1', 'Main Library', 4, 4
    UNION ALL SELECT '978-0-06-112009-1', 'North Branch', 3, 3
) AS seed
JOIN books ON books.isbn = seed.isbn
JOIN library_branches AS branches ON branches.name = seed.branch_name
ON DUPLICATE KEY UPDATE
    total_copies = VALUES(total_copies),
    available_copies = VALUES(available_copies);
