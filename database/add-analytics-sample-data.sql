-- Additional sample data for enhanced analytics
USE digital_library;

-- Add more recent loans with varied times and dates for better analytics
INSERT INTO book_loans (user_id, book_id, loan_date, due_date, return_date, status, issued_by) VALUES
-- Recent loans (last 30 days) with different hours
(4, 5, '2026-04-15 09:30:00', '2026-05-15', '2026-04-28 14:20:00', 'returned', 2),
(5, 6, '2026-04-18 14:15:00', '2026-05-18', NULL, 'active', 2),
(6, 7, '2026-04-20 11:45:00', '2026-05-20', '2026-05-02 16:30:00', 'returned', 3),
(7, 8, '2026-04-22 16:20:00', '2026-05-22', NULL, 'active', 2),
(8, 1, '2026-04-25 10:10:00', '2026-05-25', NULL, 'active', 3),
(4, 2, '2026-04-28 13:40:00', '2026-05-28', NULL, 'active', 2),
(5, 3, '2026-05-01 08:50:00', '2026-05-31', NULL, 'active', 2),
(6, 4, '2026-05-03 15:25:00', '2026-06-02', NULL, 'active', 3),
(7, 5, '2026-05-05 12:15:00', '2026-06-04', NULL, 'active', 2),
(8, 6, '2026-05-07 17:30:00', '2026-06-06', NULL, 'active', 2),

-- Peak hours data (different times of day)
(4, 7, '2026-04-10 09:00:00', '2026-05-10', '2026-04-25 10:00:00', 'returned', 2),
(5, 8, '2026-04-12 10:30:00', '2026-05-12', '2026-04-27 11:30:00', 'returned', 2),
(6, 1, '2026-04-14 14:00:00', '2026-05-14', '2026-04-29 15:00:00', 'returned', 3),
(7, 2, '2026-04-16 15:30:00', '2026-05-16', '2026-05-01 16:30:00', 'returned', 2),
(8, 3, '2026-04-18 11:15:00', '2026-05-18', '2026-05-03 12:15:00', 'returned', 2),
(4, 4, '2026-04-20 16:45:00', '2026-05-20', '2026-05-05 17:45:00', 'returned', 3),
(5, 5, '2026-04-22 13:20:00', '2026-05-22', '2026-05-07 14:20:00', 'returned', 2),

-- Weekly pattern data (different days of week)
(6, 6, '2026-04-21 10:00:00', '2026-05-21', '2026-05-06 11:00:00', 'returned', 2), -- Monday
(7, 7, '2026-04-22 14:30:00', '2026-05-22', '2026-05-07 15:30:00', 'returned', 3), -- Tuesday  
(8, 8, '2026-04-23 11:45:00', '2026-05-23', '2026-05-08 12:45:00', 'returned', 2), -- Wednesday
(4, 1, '2026-04-24 16:15:00', '2026-05-24', '2026-05-09 17:15:00', 'returned', 2), -- Thursday
(5, 2, '2026-04-25 09:30:00', '2026-05-25', '2026-05-10 10:30:00', 'returned', 3), -- Friday
(6, 3, '2026-04-26 13:00:00', '2026-05-26', '2026-05-11 14:00:00', 'returned', 2), -- Saturday
(7, 4, '2026-04-27 15:45:00', '2026-05-27', '2026-05-12 16:45:00', 'returned', 2); -- Sunday

-- Add more fines for revenue analysis
INSERT INTO fines (user_id, loan_id, fine_type, amount, paid_amount, description, status, created_at, updated_at) VALUES
(4, 1, 'overdue', 12.50, 12.50, 'Late return fine', 'paid', '2026-04-28 10:00:00', '2026-04-29 14:30:00'),
(5, 2, 'overdue', 8.00, 8.00, 'Late return fine', 'paid', '2026-05-01 11:00:00', '2026-05-02 09:15:00'),
(6, 3, 'damage', 25.00, 25.00, 'Book cover damage', 'paid', '2026-05-03 15:00:00', '2026-05-03 16:20:00'),
(7, 4, 'overdue', 15.50, 0.00, 'Late return fine', 'pending', '2026-05-05 12:00:00', '2026-05-05 12:00:00'),
(8, 5, 'lost', 45.00, 0.00, 'Lost book replacement', 'pending', '2026-05-07 14:00:00', '2026-05-07 14:00:00');

-- Add more recent user registrations
INSERT INTO users (user_id, full_name, email, password_hash, role, status, created_at) VALUES
('USR009', 'Alice Johnson', 'alice.johnson@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2026-04-15 10:30:00'),
('USR010', 'Bob Wilson', 'bob.wilson@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2026-04-20 14:15:00'),
('USR011', 'Carol Davis', 'carol.davis@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2026-05-01 09:45:00'),
('USR012', 'David Brown', 'david.brown@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', '2026-05-05 16:20:00');

-- Add more books to different categories for better distribution
INSERT INTO books (isbn, title, author, publisher, publication_year, category_id, description, total_copies, available_copies, pages, language, price) VALUES
('978-0-553-21311-7', 'Dune', 'Frank Herbert', 'Ace Books', 1965, 2, 'Epic science fiction novel', 4, 2, 688, 'English', 19.99),
('978-0-345-39180-3', 'Neuromancer', 'William Gibson', 'Ace Books', 1984, 2, 'Cyberpunk science fiction', 3, 3, 271, 'English', 16.99),
('978-0-06-440055-8', 'Where the Crawdads Sing', 'Delia Owens', 'G.P. Putnam\'s Sons', 2018, 1, 'Mystery and coming-of-age story', 6, 4, 370, 'English', 17.99),
('978-0-525-47535-5', 'Educated', 'Tara Westover', 'Random House', 2018, 3, 'Memoir about education and family', 5, 5, 334, 'English', 18.99),
('978-0-7432-2767-0', 'The Kite Runner', 'Khaled Hosseini', 'Riverhead Books', 2003, 1, 'Story of friendship and redemption', 4, 3, 371, 'English', 15.99);