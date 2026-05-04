-- Sample data for Digital Library Management System
USE digital_library;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('library_name', 'Digital Library Management System', 'Name of the library'),
('max_borrow_days', '30', 'Maximum number of days a book can be borrowed'),
('max_books_per_user', '5', 'Maximum number of books a user can borrow at once'),
('fine_per_day', '0.50', 'Fine amount per day for overdue books (USD)'),
('reservation_expiry_days', '3', 'Number of days a reservation remains valid'),
('max_renewal_count', '2', 'Maximum number of times a book can be renewed'),
('notification_email', 'library@example.com', 'Email address for system notifications'),
('chapa_public_key', 'CHAPA_PUBLIC_KEY_HERE', 'Chapa payment gateway public key'),
('chapa_secret_key', 'CHAPA_SECRET_KEY_HERE', 'Chapa payment gateway secret key'),
('google_books_api_key', 'GOOGLE_BOOKS_API_KEY_HERE', 'Google Books API key for metadata'),
('sendgrid_api_key', 'SENDGRID_API_KEY_HERE', 'SendGrid API key for email notifications');

-- Insert default categories
INSERT INTO categories (name, description, color_code) VALUES
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

-- Insert default admin user
INSERT INTO users (user_id, full_name, email, password_hash, role, status) VALUES
('ADMIN001', 'System Administrator', 'admin@digitallibrary.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

-- Insert sample librarians
INSERT INTO users (user_id, full_name, email, phone, address, password_hash, role, status) VALUES
('LIB001', 'Sarah Johnson', 'sarah@library.com', '+1-555-0101', '123 Library St, City, State', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active'),
('LIB002', 'Michael Chen', 'michael@library.com', '+1-555-0102', '456 Book Ave, City, State', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active'),
('LIB003', 'Emily Davis', 'emily@library.com', '+1-555-0103', '789 Reading Rd, City, State', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'inactive');

-- Insert sample users
INSERT INTO users (user_id, full_name, email, phone, address, password_hash, role, status) VALUES
('USR001', 'John Doe', 'john.doe@example.com', '+1-555-1234', '123 Main St, City, State 12345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('USR002', 'Jane Smith', 'jane.smith@example.com', '+1-555-5678', '456 Oak Ave, City, State 12345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('USR003', 'Bob Johnson', 'bob.johnson@example.com', '+1-555-9012', '789 Pine St, City, State 12345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('USR004', 'Alice Brown', 'alice.brown@example.com', '+1-555-3456', '321 Elm St, City, State 12345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('USR005', 'Charlie Wilson', 'charlie.wilson@example.com', '+1-555-7890', '654 Maple Ave, City, State 12345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active');

-- Insert sample books
INSERT INTO books (isbn, title, author, publisher, publication_year, category_id, description, total_copies, available_copies, pages, language, price) VALUES
('978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 1, 'A classic American novel set in the Jazz Age', 5, 3, 180, 'English', 15.99),
('978-0-452-28423-4', '1984', 'George Orwell', 'Penguin Books', 1949, 1, 'A dystopian social science fiction novel', 8, 2, 328, 'English', 13.99),
('978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 1, 'A novel about racial injustice and childhood in the American South', 6, 4, 376, 'English', 14.99),
('978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 1813, 7, 'A romantic novel of manners', 4, 4, 432, 'English', 12.99),
('978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 1, 'A controversial novel about teenage rebellion', 3, 3, 277, 'English', 16.99),
('978-0-06-085052-4', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', 1932, 2, 'A dystopian novel about a technologically advanced future society', 5, 5, 311, 'English', 15.49),
('978-0-7432-7357-2', 'Moby Dick', 'Herman Melville', 'Scribner', 1851, 1, 'The epic tale of Captain Ahab and the white whale', 3, 3, 635, 'English', 18.99),
('978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', 1937, 1, 'A fantasy adventure novel', 7, 6, 310, 'English', 14.99);

-- Insert sample book loans
INSERT INTO book_loans (user_id, book_id, loan_date, due_date, status, issued_by) VALUES
(4, 1, '2026-04-20', '2026-05-20', 'active', 2),
(4, 2, '2026-04-25', '2026-05-25', 'active', 2),
(5, 3, '2026-03-15', '2026-04-15', 'overdue', 2),
(6, 1, '2026-04-01', '2026-05-01', 'active', 3),
(7, 4, '2026-04-10', '2026-05-10', 'active', 2);

-- Insert sample reservations
INSERT INTO book_reservations (user_id, book_id, queue_position, status) VALUES
(7, 2, 1, 'pending'),
(8, 1, 2, 'pending');

-- Insert sample fines
INSERT INTO fines (user_id, loan_id, fine_type, amount, description, status) VALUES
(5, 3, 'overdue', 15.00, 'Book overdue by 30 days', 'pending'),
(8, NULL, 'damage', 25.00, 'Book returned with water damage', 'paid');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, related_id, related_type) VALUES
(4, 'due_reminder', 'Book Due Soon', 'Your borrowed book "The Great Gatsby" is due in 3 days', 1, 'loan'),
(7, 'reservation_available', 'Book Reserved', 'Your reservation for "Pride and Prejudice" is confirmed', 1, 'reservation'),
(5, 'overdue_alert', 'Overdue Book', 'The book "To Kill a Mockingbird" is overdue. Please return it to avoid fines', 3, 'loan'),
(4, 'general', 'New Books Available', '25 new books have been added to the Fiction category', NULL, NULL),
(8, 'payment_success', 'Fine Paid', 'Your overdue fine of $5.00 has been successfully paid', 2, 'fine');

-- Insert sample reviews
INSERT INTO book_reviews (user_id, book_id, rating, review_text) VALUES
(4, 1, 5, 'An absolutely brilliant novel! Fitzgerald\'s writing is mesmerizing.'),
(5, 2, 4, 'A thought-provoking dystopian masterpiece. Highly recommended.'),
(6, 3, 5, 'A timeless classic that everyone should read. Powerful and moving.'),
(7, 4, 4, 'Austen\'s wit and social commentary are exceptional.'),
(4, 6, 5, 'Huxley\'s vision of the future is both fascinating and terrifying.');

-- Insert sample reading history
INSERT INTO reading_history (user_id, book_id, start_date, completion_date, progress_percentage, status) VALUES
(4, 5, '2026-03-10', '2026-03-18', 100, 'completed'),
(4, 6, '2026-03-20', NULL, 65, 'reading'),
(5, 7, '2026-02-28', '2026-03-15', 100, 'completed'),
(6, 8, '2026-04-01', NULL, 30, 'reading');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, points) VALUES
('Bookworm', 'Read 10 books', 'book-icon', 'books_read', 10, 100),
('Speed Reader', 'Finish 5 books in a month', 'speed-icon', 'books_read', 5, 150),
('Diverse Reader', 'Read from 5 different categories', 'diversity-icon', 'books_read', 5, 200),
('Reviewer', 'Write 20 reviews', 'review-icon', 'reviews_written', 20, 75);

-- Insert sample user achievements
INSERT INTO user_achievements (user_id, achievement_id) VALUES
(4, 1),
(4, 4),
(5, 2);

-- Insert sample reading goals
INSERT INTO reading_goals (user_id, goal_type, target_books, current_progress, start_date, end_date) VALUES
(4, 'yearly', 50, 32, '2026-01-01', '2026-12-31'),
(4, 'monthly', 5, 3, '2026-05-01', '2026-05-31'),
(5, 'yearly', 24, 12, '2026-01-01', '2026-12-31');

-- Insert sample library branch
INSERT INTO library_branches (name, address, phone, email, manager_id) VALUES
('Main Library', '123 Library Street, Downtown, City 12345', '+1-555-LIBRARY', 'main@digitallibrary.com', 2),
('North Branch', '456 North Ave, Northside, City 12346', '+1-555-NORTH', 'north@digitallibrary.com', 3);

-- Insert sample branch inventory
INSERT INTO book_branch_inventory (book_id, branch_id, total_copies, available_copies) VALUES
(1, 1, 3, 1),
(1, 2, 2, 2),
(2, 1, 5, 1),
(2, 2, 3, 1),
(3, 1, 4, 3),
(4, 1, 4, 4),
(5, 1, 3, 3),
(6, 1, 3, 3),
(6, 2, 2, 2),
(7, 1, 2, 2),
(7, 2, 1, 1),
(8, 1, 4, 3),
(8, 2, 3, 3);