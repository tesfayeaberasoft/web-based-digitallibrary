-- Database Backup Created: 2026-10-07 21:34:55
-- Database: digital_library

-- Table: achievements
DROP TABLE IF EXISTS `achievements`;
Create Table;

-- Data for table achievements
INSERT INTO `achievements` VALUES ('1', 'Bookworm', 'Read 10 books', 'book-icon', 'books_read', '10', '100', '2026-10-06 14:25:00');
INSERT INTO `achievements` VALUES ('2', 'Speed Reader', 'Finish 5 books in a month', 'speed-icon', 'books_read', '5', '150', '2026-10-06 14:25:00');
INSERT INTO `achievements` VALUES ('3', 'Diverse Reader', 'Read from 5 different categories', 'diversity-icon', 'books_read', '5', '200', '2026-10-06 14:25:00');
INSERT INTO `achievements` VALUES ('4', 'Reviewer', 'Write 20 reviews', 'review-icon', 'reviews_written', '20', '75', '2026-10-06 14:25:00');

-- Table: audit_logs
DROP TABLE IF EXISTS `audit_logs`;
Create Table;

-- Data for table audit_logs
INSERT INTO `audit_logs` VALUES ('1', '5', 'return_book', 'book_loans', '7', NULL, NULL, '::1', NULL, '2026-10-07 13:40:20');
INSERT INTO `audit_logs` VALUES ('2', '5', 'return_book', 'book_loans', '12', NULL, NULL, '::1', NULL, '2026-10-07 13:40:33');
INSERT INTO `audit_logs` VALUES ('3', '2', 'return_book', 'book_loans', '15', NULL, NULL, '::1', NULL, '2026-10-07 13:47:41');
INSERT INTO `audit_logs` VALUES ('4', '2', 'return_book', 'book_loans', '4', NULL, NULL, '::1', NULL, '2026-10-07 13:48:02');
INSERT INTO `audit_logs` VALUES ('5', '2', 'bulk_issue_books', 'book_loans', '32', NULL, '{\"user_id\":26,\"book_count\":1,\"loan_ids\":[\"32\"],\"due_date\":\"2026-10-19\"}', '::1', NULL, '2026-10-07 13:50:12');
INSERT INTO `audit_logs` VALUES ('6', '26', 'renew_book', 'book_loans', '32', NULL, NULL, '::1', NULL, '2026-10-07 13:51:24');

-- Table: book_branch_inventory
DROP TABLE IF EXISTS `book_branch_inventory`;
Create Table;

-- Data for table book_branch_inventory
INSERT INTO `book_branch_inventory` VALUES ('1', '1', '1', '3', '1');
INSERT INTO `book_branch_inventory` VALUES ('2', '1', '2', '2', '2');
INSERT INTO `book_branch_inventory` VALUES ('3', '2', '1', '5', '1');
INSERT INTO `book_branch_inventory` VALUES ('4', '2', '2', '3', '1');
INSERT INTO `book_branch_inventory` VALUES ('5', '3', '1', '4', '3');
INSERT INTO `book_branch_inventory` VALUES ('6', '4', '1', '4', '4');
INSERT INTO `book_branch_inventory` VALUES ('7', '5', '1', '3', '3');
INSERT INTO `book_branch_inventory` VALUES ('8', '6', '1', '3', '3');
INSERT INTO `book_branch_inventory` VALUES ('9', '6', '2', '2', '2');
INSERT INTO `book_branch_inventory` VALUES ('10', '7', '1', '2', '2');
INSERT INTO `book_branch_inventory` VALUES ('11', '7', '2', '1', '1');
INSERT INTO `book_branch_inventory` VALUES ('12', '8', '1', '4', '3');
INSERT INTO `book_branch_inventory` VALUES ('13', '8', '2', '3', '3');

-- Table: book_loans
DROP TABLE IF EXISTS `book_loans`;
Create Table;

-- Data for table book_loans
INSERT INTO `book_loans` VALUES ('1', '4', '1', '2026-04-20 00:00:00', '2026-05-20 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_loans` VALUES ('2', '4', '2', '2026-04-25 00:00:00', '2026-05-25 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_loans` VALUES ('3', '5', '3', '2026-03-15 00:00:00', '2026-04-15 00:00:00', NULL, 'overdue', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_loans` VALUES ('4', '6', '1', '2026-04-01 00:00:00', '2026-05-01 00:00:00', '2026-10-07 00:00:00', 'returned', '0', '0.00', NULL, '3', '2', '2026-10-06 14:25:00', '2026-10-07 13:48:02');
INSERT INTO `book_loans` VALUES ('5', '7', '4', '2026-04-10 00:00:00', '2026-05-10 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_loans` VALUES ('6', '4', '5', '2026-04-15 00:00:00', '2026-05-15 00:00:00', '2026-04-28 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('7', '5', '6', '2026-04-18 00:00:00', '2026-05-18 00:00:00', '2026-10-07 00:00:00', 'returned', '0', '0.00', NULL, '2', '5', '2026-10-06 14:36:27', '2026-10-07 13:40:20');
INSERT INTO `book_loans` VALUES ('8', '6', '7', '2026-04-20 00:00:00', '2026-05-20 00:00:00', '2026-05-02 00:00:00', 'returned', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('9', '7', '8', '2026-04-22 00:00:00', '2026-05-22 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('10', '8', '1', '2026-04-25 00:00:00', '2026-05-25 00:00:00', NULL, 'active', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('11', '4', '2', '2026-04-28 00:00:00', '2026-05-28 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('12', '5', '3', '2026-05-01 00:00:00', '2026-05-31 00:00:00', '2026-10-07 00:00:00', 'returned', '0', '0.00', NULL, '2', '5', '2026-10-06 14:36:27', '2026-10-07 13:40:33');
INSERT INTO `book_loans` VALUES ('13', '6', '4', '2026-05-03 00:00:00', '2026-06-02 00:00:00', NULL, 'active', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('14', '7', '5', '2026-05-05 00:00:00', '2026-06-04 00:00:00', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('15', '8', '6', '2026-05-07 00:00:00', '2026-06-06 00:00:00', '2026-10-07 00:00:00', 'returned', '0', '0.00', NULL, '2', '2', '2026-10-06 14:36:27', '2026-10-07 13:47:41');
INSERT INTO `book_loans` VALUES ('16', '4', '7', '2026-04-10 00:00:00', '2026-05-10 00:00:00', '2026-04-25 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('17', '5', '8', '2026-04-12 00:00:00', '2026-05-12 00:00:00', '2026-04-27 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('18', '6', '1', '2026-04-14 00:00:00', '2026-05-14 00:00:00', '2026-04-29 00:00:00', 'returned', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('19', '7', '2', '2026-04-16 00:00:00', '2026-05-16 00:00:00', '2026-05-01 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('20', '8', '3', '2026-04-18 00:00:00', '2026-05-18 00:00:00', '2026-05-03 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('21', '4', '4', '2026-04-20 00:00:00', '2026-05-20 00:00:00', '2026-05-05 00:00:00', 'returned', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('22', '5', '5', '2026-04-22 00:00:00', '2026-05-22 00:00:00', '2026-05-07 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('23', '6', '6', '2026-04-21 00:00:00', '2026-05-21 00:00:00', '2026-05-06 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('24', '7', '7', '2026-04-22 00:00:00', '2026-05-22 00:00:00', '2026-05-07 00:00:00', 'returned', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('25', '8', '8', '2026-04-23 00:00:00', '2026-05-23 00:00:00', '2026-05-08 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('26', '4', '1', '2026-04-24 00:00:00', '2026-05-24 00:00:00', '2026-05-09 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('27', '5', '2', '2026-04-25 00:00:00', '2026-05-25 00:00:00', '2026-05-10 00:00:00', 'returned', '0', '0.00', NULL, '3', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('28', '6', '3', '2026-04-26 00:00:00', '2026-05-26 00:00:00', '2026-05-11 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('29', '7', '4', '2026-04-27 00:00:00', '2026-05-27 00:00:00', '2026-05-12 00:00:00', 'returned', '0', '0.00', NULL, '2', NULL, '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `book_loans` VALUES ('30', '5', '10', '2026-10-07 00:00:00', '2026-10-21 00:00:00', NULL, 'active', '0', '0.00', NULL, '5', NULL, '2026-10-07 13:41:51', '2026-10-07 13:41:51');
INSERT INTO `book_loans` VALUES ('31', '5', '11', '2026-10-07 00:00:00', '2026-10-21 00:00:00', NULL, 'active', '0', '0.00', NULL, '5', NULL, '2026-10-07 13:42:01', '2026-10-07 13:42:01');
INSERT INTO `book_loans` VALUES ('32', '26', '9', '2026-10-07 00:00:00', '2026-11-02 00:00:00', NULL, 'renewed', '1', '0.00', NULL, '2', NULL, '2026-10-07 13:50:12', '2026-10-07 13:51:24');

-- Table: book_reservations
DROP TABLE IF EXISTS `book_reservations`;
Create Table;

-- Data for table book_reservations
INSERT INTO `book_reservations` VALUES ('1', '7', '2', '2026-10-06 14:25:00', 'pending', '1', NULL, '0', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_reservations` VALUES ('2', '8', '1', '2026-10-06 14:25:00', 'available', '2', NULL, '0', '2026-10-06 14:25:00', '2026-10-07 13:48:02');

-- Table: book_reviews
DROP TABLE IF EXISTS `book_reviews`;
Create Table;

-- Data for table book_reviews
INSERT INTO `book_reviews` VALUES ('1', '4', '1', '5', 'An absolutely brilliant novel! Fitzgerald\'s writing is mesmerizing.', 'approved', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_reviews` VALUES ('2', '5', '2', '4', 'A thought-provoking dystopian masterpiece. Highly recommended.', 'approved', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_reviews` VALUES ('3', '6', '3', '5', 'A timeless classic that everyone should read. Powerful and moving.', 'approved', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_reviews` VALUES ('4', '7', '4', '4', 'Austen\'s wit and social commentary are exceptional.', 'approved', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `book_reviews` VALUES ('5', '4', '6', '5', 'Huxley\'s vision of the future is both fascinating and terrifying.', 'approved', '2026-10-06 14:25:00', '2026-10-06 14:25:00');

-- Table: books
DROP TABLE IF EXISTS `books`;
Create Table;

-- Data for table books
INSERT INTO `books` VALUES ('1', '978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', '1925', '1', 'A classic American novel set in the Jazz Age', NULL, '5', '4', '180', 'English', NULL, 'physical', '15.99', 'active', '2026-10-06 14:25:00', '2026-10-07 13:48:02');
INSERT INTO `books` VALUES ('2', '978-0-452-28423-4', '1984', 'George Orwell', 'Penguin Books', '1949', '1', 'A dystopian social science fiction novel', NULL, '8', '2', '328', 'English', NULL, 'physical', '13.99', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `books` VALUES ('3', '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', '1960', '1', 'A novel about racial injustice and childhood in the American South', NULL, '6', '5', '376', 'English', NULL, 'physical', '14.99', 'active', '2026-10-06 14:25:00', '2026-10-07 13:40:33');
INSERT INTO `books` VALUES ('4', '978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', '0000', '7', 'A romantic novel of manners', NULL, '4', '4', '432', 'English', NULL, 'physical', '12.99', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `books` VALUES ('5', '978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', '1951', '1', 'A controversial novel about teenage rebellion', NULL, '3', '3', '277', 'English', NULL, 'physical', '16.99', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `books` VALUES ('6', '978-0-06-085052-4', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', '1932', '2', 'A dystopian novel about a technologically advanced future society', NULL, '5', '7', '311', 'English', NULL, 'physical', '15.49', 'active', '2026-10-06 14:25:00', '2026-10-07 13:47:41');
INSERT INTO `books` VALUES ('7', '978-0-7432-7357-2', 'Moby Dick', 'Herman Melville', 'Scribner', '0000', '1', 'The epic tale of Captain Ahab and the white whale', NULL, '3', '3', '635', 'English', NULL, 'physical', '18.99', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `books` VALUES ('8', '978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', '1937', '1', 'A fantasy adventure novel', NULL, '7', '6', '310', 'English', NULL, 'physical', '14.99', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `books` VALUES ('9', '978-0-553-21311-7', 'Dune', 'Frank Herbert', 'Ace Books', '1965', '2', 'Epic science fiction novel', NULL, '4', '1', '688', 'English', NULL, 'physical', '19.99', 'active', '2026-10-06 14:36:27', '2026-10-07 13:50:12');
INSERT INTO `books` VALUES ('10', '978-0-345-39180-3', 'Neuromancer', 'William Gibson', 'Ace Books', '1984', '2', 'Cyberpunk science fiction', NULL, '3', '2', '271', 'English', NULL, 'physical', '16.99', 'active', '2026-10-06 14:36:27', '2026-10-07 13:41:51');
INSERT INTO `books` VALUES ('11', '978-0-06-440055-8', 'Where the Crawdads Sing', 'Delia Owens', 'G.P. Putnam\'s Sons', '2018', '1', 'Mystery and coming-of-age story', NULL, '6', '3', '370', 'English', NULL, 'physical', '17.99', 'active', '2026-10-06 14:36:27', '2026-10-07 13:42:01');
INSERT INTO `books` VALUES ('12', '978-0-525-47535-5', 'Educated', 'Tara Westover', 'Random House', '2018', '3', 'Memoir about education and family', NULL, '5', '5', '334', 'English', NULL, 'physical', '18.99', 'active', '2026-10-06 14:36:27', '2026-10-06 14:36:27');
INSERT INTO `books` VALUES ('13', '978-0-7432-2767-0', 'The Kite Runner', 'Khaled Hosseini', 'Riverhead Books', '2003', '1', 'Story of friendship and redemption', NULL, '4', '3', '371', 'English', NULL, 'physical', '15.99', 'active', '2026-10-06 14:36:27', '2026-10-06 14:36:27');

-- Table: categories
DROP TABLE IF EXISTS `categories`;
Create Table;

-- Data for table categories
INSERT INTO `categories` VALUES ('1', 'Fiction', 'Fictional literature including novels and short stories', '#9b59b6', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('2', 'Science', 'Scientific books and research materials', '#3498db', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('3', 'Academic', 'Academic textbooks and educational materials', '#e74c3c', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('4', 'History', 'Historical books and documentaries', '#f39c12', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('5', 'Technology', 'Technology, programming, and computer science books', '#2ecc71', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('6', 'Arts', 'Art, music, and creative literature', '#e91e63', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('7', 'Romance', 'Romance novels and love stories', '#ff6b9d', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('8', 'Journals', 'Academic journals and periodicals', '#34495e', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('9', 'Photography', 'Photography books and visual arts', '#fd79a8', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('10', 'Music', 'Music theory, history, and biographies', '#6c5ce7', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('11', 'Gaming', 'Gaming guides and industry books', '#a29bfe', '2026-10-06 14:24:59');
INSERT INTO `categories` VALUES ('12', 'Business', 'Business, economics, and management books', '#00b894', '2026-10-06 14:24:59');

-- Table: fines
DROP TABLE IF EXISTS `fines`;
Create Table;

-- Data for table fines
INSERT INTO `fines` VALUES ('1', '5', '3', 'overdue', '15.00', 'Book overdue by 30 days', 'pending', '0.00', NULL, NULL, NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `fines` VALUES ('2', '8', NULL, 'damage', '25.00', 'Book returned with water damage', 'paid', '0.00', NULL, NULL, NULL, '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `fines` VALUES ('3', '4', '1', 'overdue', '12.50', 'Late return fine', 'paid', '12.50', NULL, NULL, NULL, '2026-04-28 10:00:00', '2026-04-29 14:30:00');
INSERT INTO `fines` VALUES ('4', '5', '2', 'overdue', '8.00', 'Late return fine', 'paid', '8.00', NULL, NULL, NULL, '2026-05-01 11:00:00', '2026-05-02 09:15:00');
INSERT INTO `fines` VALUES ('5', '6', '3', 'damage', '25.00', 'Book cover damage', 'paid', '25.00', NULL, NULL, NULL, '2026-05-03 15:00:00', '2026-05-03 16:20:00');
INSERT INTO `fines` VALUES ('6', '7', '4', 'overdue', '15.50', 'Late return fine', 'pending', '0.00', NULL, NULL, NULL, '2026-05-05 12:00:00', '2026-05-05 12:00:00');
INSERT INTO `fines` VALUES ('7', '8', '5', 'lost', '45.00', 'Lost book replacement', 'pending', '0.00', NULL, NULL, NULL, '2026-05-07 14:00:00', '2026-05-07 14:00:00');
INSERT INTO `fines` VALUES ('8', '5', '7', 'overdue', '710.00', 'Overdue return', 'pending', '0.00', NULL, NULL, NULL, '2026-10-07 13:40:20', '2026-10-07 13:40:20');
INSERT INTO `fines` VALUES ('9', '5', '12', 'overdue', '645.00', 'Overdue return', 'pending', '0.00', NULL, NULL, NULL, '2026-10-07 13:40:33', '2026-10-07 13:40:33');
INSERT INTO `fines` VALUES ('10', '8', '15', 'overdue', '615.00', 'Overdue return', 'pending', '0.00', NULL, NULL, NULL, '2026-10-07 13:47:41', '2026-10-07 13:47:41');
INSERT INTO `fines` VALUES ('11', '6', '4', 'overdue', '795.00', 'Overdue return', 'pending', '0.00', NULL, NULL, NULL, '2026-10-07 13:48:02', '2026-10-07 13:48:02');

-- Table: librarian_performance
DROP TABLE IF EXISTS `librarian_performance`;
Create Table;

-- Data for table librarian_performance
INSERT INTO `librarian_performance` VALUES ('1', '2', '57', '36', '9', '4.18', '10', '2026', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_performance` VALUES ('2', '3', '49', '28', '9', '4.01', '10', '2026', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_performance` VALUES ('3', '4', '21', '12', '12', '4.55', '10', '2026', '2026-10-06 14:25:36', '2026-10-06 14:25:36');

-- Table: librarian_schedules
DROP TABLE IF EXISTS `librarian_schedules`;
Create Table;

-- Data for table librarian_schedules
INSERT INTO `librarian_schedules` VALUES ('1', '2', '1', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('2', '3', '1', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('3', '4', '1', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('4', '2', '2', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('5', '3', '2', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('6', '4', '2', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('7', '2', '3', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('8', '3', '3', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('9', '4', '3', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('10', '2', '4', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('11', '3', '4', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('12', '4', '4', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('13', '2', '5', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('14', '3', '5', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_schedules` VALUES ('15', '4', '5', '08:00:00', '16:00:00', '1', '2026-10-06 14:25:36', '2026-10-06 14:25:36');

-- Table: librarian_stats
DROP TABLE IF EXISTS `librarian_stats`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `librarian_stats` AS select `u`.`id` AS `id`,`u`.`full_name` AS `full_name`,`u`.`employee_id` AS `employee_id`,`u`.`department` AS `department`,`u`.`shift` AS `shift`,`u`.`status` AS `status`,`u`.`hire_date` AS `hire_date`,coalesce(`lp`.`books_processed`,0) AS `books_processed`,coalesce(`lp`.`users_assisted`,0) AS `users_assisted`,coalesce(`lp`.`tasks_completed`,0) AS `tasks_completed`,coalesce(`lp`.`performance_score`,0.00) AS `performance_score`,(select count(0) from `librarian_tasks` `lt` where `lt`.`librarian_id` = `u`.`id` and `lt`.`status` = 'pending') AS `pending_tasks`,(select count(0) from `book_loans` `bl` where `bl`.`issued_by` = `u`.`id` and cast(`bl`.`created_at` as date) = curdate()) AS `books_issued_today` from (`users` `u` left join `librarian_performance` `lp` on(`u`.`id` = `lp`.`librarian_id` and `lp`.`month` = month(curdate()) and `lp`.`year` = year(curdate()))) where `u`.`role` = 'librarian';

-- Data for table librarian_stats
INSERT INTO `librarian_stats` VALUES ('2', 'Sarah Johnson', '', '', 'morning', 'active', '2026-10-07', '57', '36', '9', '4.18', '2', '1');
INSERT INTO `librarian_stats` VALUES ('3', 'Michael Chen', 'LIB0003', 'General', 'morning', 'active', '2026-10-06', '49', '28', '9', '4.01', '2', '0');
INSERT INTO `librarian_stats` VALUES ('4', 'Emily Davis', 'LIB0004', 'General', 'morning', 'active', '2026-10-06', '21', '12', '12', '4.55', '1', '0');

-- Table: librarian_tasks
DROP TABLE IF EXISTS `librarian_tasks`;
Create Table;

-- Data for table librarian_tasks
INSERT INTO `librarian_tasks` VALUES ('1', '2', 'Monthly Inventory Check', 'Conduct monthly inventory check for assigned section', 'medium', 'pending', NULL, '2026-10-13', NULL, '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_tasks` VALUES ('2', '3', 'Monthly Inventory Check', 'Conduct monthly inventory check for assigned section', 'medium', 'pending', NULL, '2026-10-13', NULL, '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_tasks` VALUES ('3', '4', 'Monthly Inventory Check', 'Conduct monthly inventory check for assigned section', 'medium', 'pending', NULL, '2026-10-13', NULL, '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_tasks` VALUES ('4', '2', 'Update Book Catalog', 'Update digital catalog with new book arrivals', 'high', 'pending', NULL, '2026-10-09', NULL, '2026-10-06 14:25:36', '2026-10-06 14:25:36');
INSERT INTO `librarian_tasks` VALUES ('5', '3', 'Update Book Catalog', 'Update digital catalog with new book arrivals', 'high', 'pending', NULL, '2026-10-09', NULL, '2026-10-06 14:25:36', '2026-10-06 14:25:36');

-- Table: library_branches
DROP TABLE IF EXISTS `library_branches`;
Create Table;

-- Data for table library_branches
INSERT INTO `library_branches` VALUES ('1', 'Main Library', '123 Library Street, Downtown, City 12345', '+1-555-LIBRARY', 'main@digitallibrary.com', '2', 'active', '2026-10-06 14:25:00');
INSERT INTO `library_branches` VALUES ('2', 'North Branch', '456 North Ave, Northside, City 12346', '+1-555-NORTH', 'north@digitallibrary.com', '3', 'active', '2026-10-06 14:25:00');

-- Table: login_attempts
DROP TABLE IF EXISTS `login_attempts`;
Create Table;

-- Data for table login_attempts
INSERT INTO `login_attempts` VALUES ('1', 'admin@digitallibrary.com', '::1', '1', '2026-10-06 15:21:09');
INSERT INTO `login_attempts` VALUES ('2', 'sarah@library.com', '::1', '1', '2026-10-06 15:21:09');
INSERT INTO `login_attempts` VALUES ('3', 'john.doe@example.com', '::1', '1', '2026-10-06 15:21:09');
INSERT INTO `login_attempts` VALUES ('4', 'superadmin@digitallibrary.com', '::1', '1', '2026-10-06 15:21:09');
INSERT INTO `login_attempts` VALUES ('5', 'john.doe@example.com', '::1', '1', '2026-10-06 15:21:31');
INSERT INTO `login_attempts` VALUES ('6', 'john.doe@example.com', '::1', '1', '2026-10-06 15:22:02');
INSERT INTO `login_attempts` VALUES ('7', 'sarah@library.com', '::1', '1', '2026-10-06 15:23:48');
INSERT INTO `login_attempts` VALUES ('8', 'admin@digitallibrary.com', '::1', '1', '2026-10-06 15:26:32');
INSERT INTO `login_attempts` VALUES ('9', 'admin@digitallibrary.com', '::1', '1', '2026-10-06 15:26:47');
INSERT INTO `login_attempts` VALUES ('10', 'sarah@library.com', '::1', '1', '2026-10-06 15:26:47');
INSERT INTO `login_attempts` VALUES ('11', 'john.doe@example.com', '::1', '1', '2026-10-06 15:26:47');
INSERT INTO `login_attempts` VALUES ('12', 'superadmin@digitallibrary.com', '::1', '1', '2026-10-06 15:26:48');
INSERT INTO `login_attempts` VALUES ('13', 'superadmin@digitallibrary.com', '::1', '1', '2026-10-06 15:27:02');
INSERT INTO `login_attempts` VALUES ('14', 'admin@digitallibrary.com', '::1', '1', '2026-10-06 15:27:53');
INSERT INTO `login_attempts` VALUES ('15', 'sarah@library.com', '::1', '1', '2026-10-06 15:47:06');
INSERT INTO `login_attempts` VALUES ('16', 'sarah@library.com', '::1', '1', '2026-10-06 16:08:05');
INSERT INTO `login_attempts` VALUES ('17', 'john.doe@example.com', '::1', '1', '2026-10-06 16:45:11');
INSERT INTO `login_attempts` VALUES ('18', 'superadmin@digitallibrary.com', '::1', '1', '2026-10-06 16:45:26');
INSERT INTO `login_attempts` VALUES ('19', 'tesfayeaberalingane@gmail.com', '::1', '1', '2026-10-06 16:53:25');
INSERT INTO `login_attempts` VALUES ('20', 'john.doe@example.com', '::1', '1', '2026-10-06 16:54:12');
INSERT INTO `login_attempts` VALUES ('21', 'john.doe@example.com', '::1', '1', '2026-10-06 19:56:44');
INSERT INTO `login_attempts` VALUES ('22', 'sarah@library.com', '::1', '1', '2026-10-06 19:57:06');
INSERT INTO `login_attempts` VALUES ('23', 'john.doe@example.com', '::1', '1', '2026-10-06 21:33:15');
INSERT INTO `login_attempts` VALUES ('24', 'john.doe@example.com', '::1', '1', '2026-10-07 13:39:44');
INSERT INTO `login_attempts` VALUES ('25', 'sarah@library.com', '::1', '1', '2026-10-07 13:44:31');
INSERT INTO `login_attempts` VALUES ('26', 'tesfayeaberalingane@gmail.com', '::1', '1', '2026-10-07 13:50:49');
INSERT INTO `login_attempts` VALUES ('27', 'sarah@library.com', '::1', '1', '2026-10-07 13:52:17');
INSERT INTO `login_attempts` VALUES ('28', 'admin@digitallibrary.com', '::1', '1', '2026-10-07 14:05:03');
INSERT INTO `login_attempts` VALUES ('29', 'admin@digitallibrary.com', '::1', '1', '2026-10-07 14:28:52');
INSERT INTO `login_attempts` VALUES ('30', 'superadmin@digitallibrary.com', '::1', '1', '2026-10-07 14:30:07');

-- Table: maintenance_log
DROP TABLE IF EXISTS `maintenance_log`;
Create Table;

-- Table: notifications
DROP TABLE IF EXISTS `notifications`;
Create Table;

-- Data for table notifications
INSERT INTO `notifications` VALUES ('1', '4', 'due_reminder', 'Book Due Soon', 'Your borrowed book \"The Great Gatsby\" is due in 3 days', 'unread', '1', 'loan', '2026-10-06 14:25:00', NULL);
INSERT INTO `notifications` VALUES ('2', '7', 'reservation_available', 'Book Reserved', 'Your reservation for \"Pride and Prejudice\" is confirmed', 'unread', '1', 'reservation', '2026-10-06 14:25:00', NULL);
INSERT INTO `notifications` VALUES ('3', '5', 'overdue_alert', 'Overdue Book', 'The book \"To Kill a Mockingbird\" is overdue. Please return it to avoid fines', 'read', '3', 'loan', '2026-10-06 14:25:00', '2026-10-06 18:50:55');
INSERT INTO `notifications` VALUES ('4', '4', 'general', 'New Books Available', '25 new books have been added to the Fiction category', 'unread', NULL, NULL, '2026-10-06 14:25:00', NULL);
INSERT INTO `notifications` VALUES ('5', '8', 'payment_success', 'Fine Paid', 'Your overdue fine of $5.00 has been successfully paid', 'unread', '2', 'fine', '2026-10-06 14:25:00', NULL);
INSERT INTO `notifications` VALUES ('6', '5', 'fine_notice', 'Overdue Fine', 'You have a fine of $710.00 for late return of \'Brave New World\'', 'unread', NULL, NULL, '2026-10-07 13:40:20', NULL);
INSERT INTO `notifications` VALUES ('7', '5', 'general', 'Book Returned', 'You have successfully returned \'Brave New World\'', 'unread', NULL, NULL, '2026-10-07 13:40:20', NULL);
INSERT INTO `notifications` VALUES ('8', '5', 'fine_notice', 'Overdue Fine', 'You have a fine of $645.00 for late return of \'To Kill a Mockingbird\'', 'unread', NULL, NULL, '2026-10-07 13:40:33', NULL);
INSERT INTO `notifications` VALUES ('9', '5', 'general', 'Book Returned', 'You have successfully returned \'To Kill a Mockingbird\'', 'unread', NULL, NULL, '2026-10-07 13:40:33', NULL);
INSERT INTO `notifications` VALUES ('10', '5', '', 'Book Issued', 'You have successfully borrowed \'Neuromancer\'. Due date: 2026-10-21', 'unread', NULL, NULL, '2026-10-07 13:41:51', NULL);
INSERT INTO `notifications` VALUES ('11', '5', '', 'Book Issued', 'You have successfully borrowed \'Where the Crawdads Sing\'. Due date: 2026-10-21', 'unread', NULL, NULL, '2026-10-07 13:42:01', NULL);
INSERT INTO `notifications` VALUES ('12', '8', 'fine_notice', 'Overdue Fine', 'You have a fine of $615.00 for late return of \'Brave New World\'', 'unread', NULL, NULL, '2026-10-07 13:47:41', NULL);
INSERT INTO `notifications` VALUES ('13', '8', 'general', 'Book Returned', 'You have successfully returned \'Brave New World\'', 'unread', NULL, NULL, '2026-10-07 13:47:41', NULL);
INSERT INTO `notifications` VALUES ('14', '6', 'fine_notice', 'Overdue Fine', 'You have a fine of $795.00 for late return of \'The Great Gatsby\'', 'unread', NULL, NULL, '2026-10-07 13:48:02', NULL);
INSERT INTO `notifications` VALUES ('15', '6', 'general', 'Book Returned', 'You have successfully returned \'The Great Gatsby\'', 'unread', NULL, NULL, '2026-10-07 13:48:02', NULL);
INSERT INTO `notifications` VALUES ('16', '8', 'reservation_available', 'Reserved Book Available', 'Your reserved book \'The Great Gatsby\' is now available for pickup', 'unread', NULL, NULL, '2026-10-07 13:48:02', NULL);
INSERT INTO `notifications` VALUES ('17', '26', '', 'Books Issued', 'You have successfully borrowed 1 books: Dune. Due date: 2026-10-19', 'unread', NULL, NULL, '2026-10-07 13:50:12', NULL);
INSERT INTO `notifications` VALUES ('18', '26', 'general', 'Book Renewed', 'You have successfully renewed \'Dune\'. New due date: November 2, 2026', 'unread', NULL, NULL, '2026-10-07 13:51:24', NULL);
INSERT INTO `notifications` VALUES ('19', '2', 'general', 'Account Suspended', 'Your account has been suspended. Please contact the library for more information.', 'unread', NULL, NULL, '2026-10-07 14:27:19', NULL);
INSERT INTO `notifications` VALUES ('20', '2', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-10-07 14:27:29', NULL);

-- Table: payment_transactions
DROP TABLE IF EXISTS `payment_transactions`;
Create Table;

-- Table: reading_goals
DROP TABLE IF EXISTS `reading_goals`;
Create Table;

-- Data for table reading_goals
INSERT INTO `reading_goals` VALUES ('1', '4', 'yearly', '50', '32', '2026-01-01', '2026-12-31', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `reading_goals` VALUES ('2', '4', 'monthly', '5', '3', '2026-05-01', '2026-05-31', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `reading_goals` VALUES ('3', '5', 'yearly', '24', '12', '2026-01-01', '2026-12-31', 'active', '2026-10-06 14:25:00', '2026-10-06 14:25:00');

-- Table: reading_history
DROP TABLE IF EXISTS `reading_history`;
Create Table;

-- Data for table reading_history
INSERT INTO `reading_history` VALUES ('1', '4', '5', '2026-03-10', '2026-03-18', '100', '0', '0', 'completed', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `reading_history` VALUES ('2', '4', '6', '2026-03-20', NULL, '65', '0', '0', 'reading', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `reading_history` VALUES ('3', '5', '7', '2026-02-28', '2026-03-15', '100', '0', '0', 'completed', '2026-10-06 14:25:00', '2026-10-06 14:25:00');
INSERT INTO `reading_history` VALUES ('4', '6', '8', '2026-04-01', NULL, '30', '0', '0', 'reading', '2026-10-06 14:25:00', '2026-10-06 14:25:00');

-- Table: settings_changelog
DROP TABLE IF EXISTS `settings_changelog`;
Create Table;

-- Table: system_settings
DROP TABLE IF EXISTS `system_settings`;
Create Table;

-- Data for table system_settings
INSERT INTO `system_settings` VALUES ('1', 'library_info', 'library_name', 'Digital Library Management System', 'string', 'Name of the library', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('2', 'library_info', 'description', 'A comprehensive digital library management solution', 'string', 'Library description', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('3', 'library_info', 'address', '123 Library Street, Education City', 'string', 'Library physical address', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('4', 'library_info', 'phone', '+1 (555) 123-4567', 'string', 'Library contact phone', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('5', 'library_info', 'email', 'info@digitallibrary.com', 'string', 'Library contact email', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('6', 'library_info', 'website', 'https://digitallibrary.com', 'string', 'Library website URL', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('7', 'library_policies', 'max_user_borrow_books', '5', 'number', 'Maximum books a user can borrow simultaneously', '2026-10-07 14:28:19', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('8', 'library_policies', 'due_fines_per_day', '0.5', 'number', 'Daily fine amount for overdue books (USD)', '2026-10-07 14:28:19', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('9', 'library_policies', 'max_book_return_days', '14', 'number', 'Maximum days allowed for book return', '2026-10-07 14:28:19', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('10', 'library_policies', 'max_reservations_per_user', '3', 'number', 'Maximum reservations per user', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('11', 'library_policies', 'reservation_hold_days', '7', 'number', 'Days to hold reserved books', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('12', 'library_policies', 'renewal_limit', '2', 'number', 'Maximum number of renewals allowed', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('13', 'library_policies', 'grace_period_days', '3', 'number', 'Grace period before fines start', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('14', 'operating_hours', 'monday', '{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false}', 'json', 'Monday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('15', 'operating_hours', 'tuesday', '{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false}', 'json', 'Tuesday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('16', 'operating_hours', 'wednesday', '{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false}', 'json', 'Wednesday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('17', 'operating_hours', 'thursday', '{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false}', 'json', 'Thursday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('18', 'operating_hours', 'friday', '{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false}', 'json', 'Friday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('19', 'operating_hours', 'saturday', '{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false}', 'json', 'Saturday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('20', 'operating_hours', 'sunday', '{\"open\":\"10:00\",\"close\":\"16:00\",\"closed\":false}', 'json', 'Sunday operating hours', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('21', 'social_media', 'facebook', 'https://facebook.com/digitallibrary', 'string', 'Facebook page URL', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('22', 'social_media', 'twitter', 'https://twitter.com/digitallibrary', 'string', 'Twitter profile URL', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('23', 'social_media', 'instagram', 'https://instagram.com/digitallibrary', 'string', 'Instagram profile URL', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('24', 'social_media', 'linkedin', 'https://linkedin.com/company/digitallibrary', 'string', 'LinkedIn company URL', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('25', 'system_config', 'allow_registration', 'true', 'boolean', 'Allow new user registration', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('26', 'system_config', 'require_email_verification', 'true', 'boolean', 'Require email verification for new users', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('27', 'system_config', 'session_timeout', '60', 'number', 'Session timeout in minutes', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('28', 'system_config', 'password_min_length', '6', 'number', 'Minimum password length', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('29', 'system_config', 'password_require_special', 'false', 'boolean', 'Require special characters in password', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('30', 'system_config', 'two_factor_auth', 'false', 'boolean', 'Enable two-factor authentication', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('31', 'system_config', 'maintenance_mode', 'false', 'boolean', 'System maintenance mode', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('32', 'system_config', 'auto_renewal', 'true', 'boolean', 'Enable automatic book renewal', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('33', 'notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('34', 'notifications', 'sms_enabled', 'false', 'boolean', 'Enable SMS notifications', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('35', 'notifications', 'push_enabled', 'true', 'boolean', 'Enable push notifications', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('36', 'notifications', 'overdue_reminders', 'true', 'boolean', 'Send overdue book reminders', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('37', 'notifications', 'reservation_alerts', 'true', 'boolean', 'Send reservation alerts', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('38', 'notifications', 'new_book_notifications', 'true', 'boolean', 'Send new book notifications', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('39', 'notifications', 'system_alerts', 'true', 'boolean', 'Send system alerts', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('40', 'notifications', 'overdue_check_time', '09:00', 'string', 'Time to check for overdue books', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('41', 'notifications', 'reservation_check_time', '10:00', 'string', 'Time to check reservations', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('42', 'notifications', 'daily_report_time', '18:00', 'string', 'Time to send daily reports', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('43', 'email_templates', 'welcome', 'Welcome to our Digital Library!', 'string', 'Welcome email template', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('44', 'email_templates', 'overdue', 'You have overdue books. Please return them.', 'string', 'Overdue notice template', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('45', 'email_templates', 'reservation', 'Your reserved book is now available.', 'string', 'Reservation ready template', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('46', 'email_templates', 'renewal', 'Your book loan has been renewed.', 'string', 'Renewal confirmation template', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('47', 'security', 'login_attempts', '5', 'number', 'Maximum login attempts before lockout', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('48', 'security', 'lockout_duration', '30', 'number', 'Account lockout duration in minutes', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('49', 'security', 'password_expiry', '90', 'number', 'Password expiry in days', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('50', 'security', 'session_security', 'true', 'boolean', 'Enhanced session security', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('51', 'security', 'audit_logging', 'true', 'boolean', 'Enable audit logging', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('52', 'security', 'data_encryption', 'true', 'boolean', 'Enable data encryption', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('53', 'security', 'cors_enabled', 'true', 'boolean', 'Enable CORS', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('54', 'security', 'https_only', 'true', 'boolean', 'Require HTTPS only', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('55', 'security', 'backup_frequency', 'daily', 'string', 'Backup frequency', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('56', 'security', 'backup_retention', '30', 'number', 'Backup retention in days', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('57', 'security', 'api_rate_limit', '100', 'number', 'API rate limit per minute', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('58', 'appearance', 'theme', 'light', 'string', 'System theme (light/dark/auto)', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('59', 'appearance', 'primary_color', '#4a9b8e', 'string', 'Primary theme color', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('60', 'appearance', 'secondary_color', '#66bb6a', 'string', 'Secondary theme color', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('61', 'appearance', 'show_branding', 'true', 'boolean', 'Show library branding', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('62', 'appearance', 'compact_mode', 'false', 'boolean', 'Enable compact mode', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('63', 'appearance', 'animations_enabled', 'true', 'boolean', 'Enable animations', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('64', 'appearance', 'custom_css', '', 'string', 'Custom CSS styles', '2026-10-06 14:34:08', NULL, '2026-10-06 14:34:08');
INSERT INTO `system_settings` VALUES ('65', 'library', 'libraryName', 'Digital Library Managemente System', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('66', 'library', 'description', 'A comprehensive digital library management solution', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('67', 'library', 'address', '123 Library Street, Education City', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('68', 'library', 'phone', '+1 (555) 123-4567', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('69', 'library', 'email', 'info@digitallibrary.com', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('70', 'library', 'website', 'https://digitallibrary.com', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('71', 'library', 'operatingHours', '{\"monday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"tuesday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"wednesday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"thursday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"friday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"saturday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"sunday\":{\"open\":\"10:00\",\"close\":\"16:00\",\"closed\":false}}', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');
INSERT INTO `system_settings` VALUES ('72', 'library', 'socialMedia', '{\"facebook\":\"https:\\/\\/facebook.com\\/digitallibrary\",\"twitter\":\"https:\\/\\/twitter.com\\/digitallibrary\",\"instagram\":\"https:\\/\\/instagram.com\\/digitallibrary\",\"linkedin\":\"https:\\/\\/linkedin.com\\/company\\/digitallibrary\"}', 'string', NULL, '2026-10-07 14:28:19', NULL, '2026-10-07 14:28:19');

-- Table: system_status
DROP TABLE IF EXISTS `system_status`;
Create Table;

-- Data for table system_status
INSERT INTO `system_status` VALUES ('1', 'cpu_usage', '23.50', 'percent', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('2', 'memory_usage', '65.20', 'percent', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('3', 'storage_usage', '78.10', 'percent', 'warning', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('4', 'database_response_time', '45.00', 'milliseconds', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('5', 'active_users', '142.00', 'count', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('6', 'total_books', '15847.00', 'count', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('7', 'active_loans', '892.00', 'count', 'healthy', '2026-10-06 14:34:08');
INSERT INTO `system_status` VALUES ('8', 'overdue_books', '23.00', 'count', 'warning', '2026-10-06 14:34:08');

-- Table: user_achievements
DROP TABLE IF EXISTS `user_achievements`;
Create Table;

-- Data for table user_achievements
INSERT INTO `user_achievements` VALUES ('1', '4', '1', '2026-10-06 14:25:00');
INSERT INTO `user_achievements` VALUES ('2', '4', '4', '2026-10-06 14:25:00');
INSERT INTO `user_achievements` VALUES ('3', '5', '2', '2026-10-06 14:25:00');

-- Table: users
DROP TABLE IF EXISTS `users`;
Create Table;

-- Data for table users
INSERT INTO `users` VALUES ('1', 'ADMIN001', NULL, 'System Administrator', 'admin@digitallibrary.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-07 14:33:39', '2026-10-07 14:28:52', NULL);
INSERT INTO `users` VALUES ('2', 'LIB001', '', 'Sarah Johnson', 'sarah@library.com', '+1-555-0101', '123 Library St, City, State', '', '2026-10-07', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, NULL, 'uploads/profile_images/user_2_1791407057.jpg', '2026-10-06 14:24:59', '2026-10-07 14:27:29', '2026-10-07 13:52:17', NULL);
INSERT INTO `users` VALUES ('3', 'LIB002', 'LIB0003', 'Michael Chen', 'michael@library.com', '+1-555-0102', '456 Book Ave, City, State', 'General', '2026-10-06', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-06 14:25:35', NULL, NULL);
INSERT INTO `users` VALUES ('4', 'LIB003', 'LIB0004', 'Emily Davis', 'emily@library.com', '+1-555-0103', '789 Reading Rd, City, State', 'General', '2026-10-06', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-07 14:26:24', NULL, NULL);
INSERT INTO `users` VALUES ('5', 'USR001', NULL, 'John Doe', 'john.doe@example.com', '+1-555-1234', '123 Main St, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, 'uploads/profile_images/user_5_1791325402.jpg', '2026-10-06 14:24:59', '2026-10-07 13:39:44', '2026-10-07 13:39:44', NULL);
INSERT INTO `users` VALUES ('6', 'USR002', NULL, 'Jane Smith', 'jane.smith@example.com', '+1-555-5678', '456 Oak Ave, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-06 14:24:59', NULL, NULL);
INSERT INTO `users` VALUES ('7', 'USR003', NULL, 'Bob Johnson', 'bob.johnson@example.com', '+1-555-9012', '789 Pine St, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-06 14:24:59', NULL, NULL);
INSERT INTO `users` VALUES ('8', 'USR004', NULL, 'Alice Brown', 'alice.brown@example.com', '+1-555-3456', '321 Elm St, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-06 14:24:59', NULL, NULL);
INSERT INTO `users` VALUES ('9', 'USR005', NULL, 'Charlie Wilson', 'charlie.wilson@example.com', '+1-555-7890', '654 Maple Ave, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-10-06 14:24:59', '2026-10-06 14:24:59', NULL, NULL);
INSERT INTO `users` VALUES ('10', 'USR009', NULL, 'Alice Johnson', 'alice.johnson@email.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-04-15 10:30:00', '2026-10-06 14:36:27', NULL, NULL);
INSERT INTO `users` VALUES ('11', 'USR010', NULL, 'Bob Wilson', 'bob.wilson@email.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-04-20 14:15:00', '2026-10-06 14:36:27', NULL, NULL);
INSERT INTO `users` VALUES ('12', 'USR011', NULL, 'Carol Davis', 'carol.davis@email.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-05-01 09:45:00', '2026-10-06 14:36:27', NULL, NULL);
INSERT INTO `users` VALUES ('13', 'USR012', NULL, 'David Brown', 'david.brown@email.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-05-05 16:20:00', '2026-10-06 14:36:27', NULL, NULL);
INSERT INTO `users` VALUES ('14', 'SUPER001', NULL, 'Super Administrator', 'superadmin@digitallibrary.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super-admin', 'active', NULL, NULL, NULL, '2026-10-06 15:15:21', '2026-10-07 14:30:07', '2026-10-07 14:30:07', NULL);
INSERT INTO `users` VALUES ('24', 'USR015', NULL, 'Test User', 'newtest99@example.com', '+1234567890', NULL, NULL, NULL, 'morning', '$2y$10$n3Ev5xFnFu0K9mV6E2pSA.P3ur2.upys.OrNPiXyjyw9/h04kvn9u', 'user', 'active', NULL, NULL, NULL, '2026-10-06 16:51:29', '2026-10-06 16:51:29', NULL, NULL);
INSERT INTO `users` VALUES ('25', 'USR016', NULL, 'Another User', 'anotheruser@example.com', '+9876543210', NULL, NULL, NULL, 'morning', '$2y$10$VaTNK8Yh3Rpq/h5tYHiJmezr5CIlomsx/IVS1pZpKCvDFya4tUtWG', 'user', 'active', NULL, NULL, NULL, '2026-10-06 16:51:56', '2026-10-06 16:51:56', NULL, NULL);
INSERT INTO `users` VALUES ('26', 'USR017', NULL, 'Tesfaye Abera Lingane', 'tesfayeaberalingane@gmail.com', '+2519112345677', '123r', NULL, NULL, 'morning', '$2y$10$fCko/tsSYcr.fVnirKu.M.2.DX9k0SsO9einmyjImi0JVHnkj9Kc.', 'user', 'active', 'Note: This reason will be recorded and may be visible to the member. Please provide a clear and professional explanation', NULL, NULL, '2026-10-06 16:53:12', '2026-10-07 14:24:13', '2026-10-07 13:50:49', NULL);

