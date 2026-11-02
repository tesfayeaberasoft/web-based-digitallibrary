-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql312.infinityfree.com
-- Generation Time: Nov 02, 2026 at 09:46 AM
-- Server version: 11.4.13-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_43312804_digital_library`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `criteria_type` enum('books_read','reading_streak','reviews_written','time_spent') NOT NULL,
  `criteria_value` int(11) NOT NULL,
  `points` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 9, 'send_manual_notifications', 'notifications', NULL, NULL, '{\"type\":\"general\",\"subject\":\"greeting\",\"recipients_count\":3,\"notifications_count\":3}', '102.213.68.143', NULL, '2026-10-31 16:29:04'),
(2, 9, 'bulk_issue_books', 'book_loans', 1, NULL, '{\"user_id\":2,\"book_count\":1,\"loan_ids\":[\"1\"],\"due_date\":\"2026-11-14\"}', '102.213.68.143', NULL, '2026-10-31 16:29:55'),
(3, 7, 'return_book', 'book_loans', 1, NULL, NULL, '102.208.97.51', NULL, '2026-11-01 18:42:44'),
(4, 7, 'update_book', 'books', 7, NULL, NULL, '102.218.51.135', NULL, '2026-11-01 20:47:55'),
(5, 7, 'bulk_issue_books', 'book_loans', 2, NULL, '{\"user_id\":11,\"book_count\":1,\"loan_ids\":[\"2\"],\"due_date\":\"2026-11-03\"}', '102.218.50.180', NULL, '2026-11-02 12:53:23'),
(6, 7, 'bulk_issue_books', 'book_loans', 3, NULL, '{\"user_id\":2,\"book_count\":1,\"loan_ids\":[\"3\"],\"due_date\":\"2026-11-02\"}', '102.218.50.180', NULL, '2026-11-02 12:54:43'),
(7, 7, 'update_book', 'books', 1, NULL, NULL, '102.218.50.188', NULL, '2026-11-02 14:04:22');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `isbn` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `publication_year` year(4) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `total_copies` int(11) DEFAULT 1,
  `available_copies` int(11) DEFAULT 1,
  `pages` int(11) DEFAULT NULL,
  `language` varchar(50) DEFAULT 'English',
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` enum('pdf','epub','physical') DEFAULT 'physical',
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive','maintenance') DEFAULT 'active',
  `condition_status` enum('new','good','fair','poor','damaged') NOT NULL DEFAULT 'good',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `isbn`, `title`, `author`, `publisher`, `publication_year`, `category_id`, `description`, `cover_image`, `total_copies`, `available_copies`, `pages`, `language`, `file_path`, `file_type`, `price`, `status`, `condition_status`, `created_at`, `updated_at`) VALUES
(1, '978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 1, 'A classic American novel set in the Jazz Age', '', 5, 4, 180, 'English', 'ebooks/9055ee63d4c738606fffbf01c670bd55.pdf', 'pdf', '15.99', 'active', 'good', '2026-10-31 09:26:55', '2026-11-02 14:04:24'),
(2, '978-0-452-28423-4', '1984', 'George Orwell', 'Penguin Books', 1949, 1, 'A dystopian social science fiction novel', NULL, 8, 7, 328, 'English', NULL, 'physical', '13.99', 'active', 'good', '2026-10-31 09:26:55', '2026-11-02 12:54:43'),
(3, '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 1, 'A novel about racial injustice and childhood in the American South', NULL, 6, 6, 376, 'English', NULL, 'physical', '14.99', 'active', 'good', '2026-10-31 09:26:55', '2026-10-31 09:26:55'),
(4, '978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 0000, 7, 'A romantic novel of manners', NULL, 4, 4, 432, 'English', NULL, 'physical', '12.99', 'active', 'good', '2026-10-31 09:26:55', '2026-10-31 09:26:55'),
(5, '978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 1951, 1, 'A novel about teenage rebellion and identity', NULL, 3, 3, 277, 'English', NULL, 'physical', '16.99', 'active', 'good', '2026-10-31 09:26:55', '2026-10-31 09:26:55'),
(6, '978-0-06-085052-4', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', 1932, 2, 'A dystopian novel about a technologically advanced future society', NULL, 5, 5, 311, 'English', NULL, 'physical', '15.49', 'active', 'good', '2026-10-31 09:26:55', '2026-10-31 09:26:55'),
(7, '978-0-7432-7357-2', 'Moby Dick', 'Herman Melville', 'Scribner', 0000, 1, 'The epic tale of Captain Ahab and the white whale', '', 5, 5, 635, 'English', NULL, 'physical', '18.99', 'active', 'good', '2026-10-31 09:26:55', '2026-11-01 20:47:55'),
(8, '978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', 1937, 1, 'A fantasy adventure novel', NULL, 7, 7, 310, 'English', NULL, 'physical', '14.99', 'active', 'good', '2026-10-31 09:26:55', '2026-10-31 09:26:55');

-- --------------------------------------------------------

--
-- Table structure for table `book_branch_inventory`
--

CREATE TABLE `book_branch_inventory` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `total_copies` int(11) DEFAULT 0,
  `available_copies` int(11) DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_loans`
--

CREATE TABLE `book_loans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `loan_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('active','returned','overdue','renewed') DEFAULT 'active',
  `renewal_count` int(11) DEFAULT 0,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `returned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `book_loans`
--

INSERT INTO `book_loans` (`id`, `user_id`, `book_id`, `loan_date`, `due_date`, `return_date`, `status`, `renewal_count`, `fine_amount`, `notes`, `issued_by`, `returned_to`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2026-10-31', '2026-11-14', '2026-11-01', 'returned', 0, '0.00', NULL, 9, 7, '2026-10-31 16:29:55', '2026-11-01 18:42:44'),
(2, 11, 1, '2026-11-02', '2026-11-03', NULL, 'active', 0, '0.00', NULL, 7, NULL, '2026-11-02 12:53:23', '2026-11-02 12:53:23'),
(3, 2, 2, '2026-11-02', '2026-11-02', NULL, 'active', 0, '0.00', NULL, 7, NULL, '2026-11-02 12:54:43', '2026-11-02 12:54:43');

-- --------------------------------------------------------

--
-- Table structure for table `book_reservations`
--

CREATE TABLE `book_reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `reservation_date` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('pending','available','fulfilled','cancelled','expired') DEFAULT 'pending',
  `queue_position` int(11) DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `notification_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `book_reviews`
--

CREATE TABLE `book_reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL
) ;

--
-- Dumping data for table `book_reviews`
--

INSERT INTO `book_reviews` (`id`, `user_id`, `book_id`, `rating`, `review_text`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, NULL, 'approved', '2026-10-31 15:55:42', '2026-10-31 15:55:42'),
(2, 2, 1, 2, NULL, 'approved', '2026-11-02 14:07:27', '2026-11-02 14:07:27');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color_code` varchar(7) DEFAULT '#3498db',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `color_code`, `created_at`) VALUES
(1, 'Fiction', 'Fictional literature including novels and short stories', '#9b59b6', '2026-10-31 09:26:55'),
(2, 'Science', 'Scientific books and research materials', '#3498db', '2026-10-31 09:26:55'),
(3, 'Academic', 'Academic textbooks and educational materials', '#e74c3c', '2026-10-31 09:26:55'),
(4, 'History', 'Historical books and documentaries', '#f39c12', '2026-10-31 09:26:55'),
(5, 'Technology', 'Technology, programming, and computer science books', '#2ecc71', '2026-10-31 09:26:55'),
(6, 'Arts', 'Art, music, and creative literature', '#e91e63', '2026-10-31 09:26:55'),
(7, 'Romance', 'Romance novels and love stories', '#ff6b9d', '2026-10-31 09:26:55'),
(8, 'Journals', 'Academic journals and periodicals', '#34495e', '2026-10-31 09:26:55'),
(9, 'Photography', 'Photography books and visual arts', '#fd79a8', '2026-10-31 09:26:55'),
(10, 'Music', 'Music theory, history, and biographies', '#6c5ce7', '2026-10-31 09:26:55'),
(11, 'Gaming', 'Gaming guides and industry books', '#a29bfe', '2026-10-31 09:26:55'),
(12, 'Business', 'Business, economics, and management books', '#00b894', '2026-10-31 09:26:55');

-- --------------------------------------------------------

--
-- Table structure for table `fines`
--

CREATE TABLE `fines` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `fine_type` enum('overdue','damage','lost','other') DEFAULT 'overdue',
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','paid','waived','partial') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','partial') DEFAULT 'unpaid',
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `paid_at` datetime DEFAULT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_branches`
--

CREATE TABLE `library_branches` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `success` tinyint(1) DEFAULT 0,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `email`, `ip_address`, `success`, `attempted_at`) VALUES
(1, 'tesfayeaberalinganee@gmail.com', '102.208.97.40', 1, '2026-10-31 12:41:51'),
(2, 'Tewodros@gmail.com', '102.213.68.143', 1, '2026-10-31 16:28:37'),
(3, 'abraham@gmail.com', '102.213.68.143', 1, '2026-10-31 16:34:09'),
(4, 'tesfaye@gmail.com', '102.213.68.143', 1, '2026-10-31 16:39:36'),
(5, 'tesfaye@gmail.com', '102.213.68.143', 1, '2026-10-31 16:54:42'),
(6, 'mekibib@gmail.com', '102.213.68.143', 1, '2026-10-31 16:57:10'),
(7, 'abraham@gmail.com', '102.213.68.143', 1, '2026-10-31 16:58:25'),
(8, 'mekibib@gmail.com', '102.213.68.143', 1, '2026-10-31 17:06:16'),
(9, 'Tewodros@gmail.com', '102.218.51.228', 1, '2026-10-31 17:51:48'),
(10, 'tewodros@gmail.com', '102.218.51.172', 1, '2026-11-01 17:15:52'),
(11, 'kidist@gmail.com', '102.208.97.51', 1, '2026-11-01 18:40:18'),
(12, 'kidist@gmail.com', '102.208.97.51', 1, '2026-11-01 19:43:43'),
(13, 'kidist@gmail.com', '102.218.51.135', 1, '2026-11-01 20:45:00'),
(14, 'kidist@gmail.com', '102.218.51.167', 1, '2026-11-02 11:00:50'),
(15, 'kidist@gmail.com', '102.208.97.55', 1, '2026-11-02 12:34:34'),
(16, 'kidist@gmail.com', '102.218.50.188', 1, '2026-11-02 13:33:46'),
(17, 'kidist@gmail.com', '102.218.50.188', 1, '2026-11-02 14:01:46'),
(18, 'kidist@gmail.com', '102.218.51.173', 1, '2026-11-02 14:08:28'),
(19, 'kidist@gmail.com', '102.218.51.173', 1, '2026-11-02 14:37:19');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `sender_role` enum('user','librarian','admin','super-admin') NOT NULL,
  `receiver_role` enum('user','librarian','admin','super-admin') NOT NULL,
  `message_content` text NOT NULL,
  `status` enum('read','unread') NOT NULL DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `sender_role`, `receiver_role`, `message_content`, `status`, `created_at`) VALUES
(1, 2, 8, 'user', 'librarian', 'Subject: greeting\n\nhow are you', 'unread', '2026-10-31 16:27:58'),
(2, 9, 5, 'librarian', 'admin', 'hello', 'read', '2026-10-31 16:33:00'),
(3, 9, 6, 'librarian', 'admin', 'hey', 'unread', '2026-10-31 16:33:08'),
(4, 5, 9, 'admin', 'librarian', 'hello', 'unread', '2026-10-31 16:38:27'),
(5, 4, 6, 'super-admin', 'admin', 'hey', 'unread', '2026-10-31 16:46:04'),
(6, 4, 5, 'super-admin', 'admin', 'hey', 'unread', '2026-10-31 16:46:13'),
(7, 10, 7, 'user', 'librarian', 'Subject: Greeting\n\nHello', 'unread', '2026-10-31 18:02:08'),
(8, 1, 9, 'user', 'librarian', 'Subject: Greeting\n\nHi', 'read', '2026-10-31 18:32:25'),
(9, 1, 7, 'user', 'librarian', 'Subject: hh\n\nvvb', 'unread', '2026-11-02 13:30:50');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `note_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `user_id`, `book_id`, `note_content`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}', '2026-11-02 14:07:04', '2026-11-02 14:07:04');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('due_reminder','overdue_alert','reservation_available','fine_notice','general','payment_success') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','archived') DEFAULT 'unread',
  `related_id` int(11) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `status`, `related_id`, `related_type`, `sent_at`, `read_at`) VALUES
(1, 1, 'general', 'greeting', 'hello', 'read', NULL, NULL, '2026-10-31 16:29:04', '2026-10-31 16:49:17'),
(2, 2, 'general', 'greeting', 'hello', 'unread', NULL, NULL, '2026-10-31 16:29:04', NULL),
(3, 3, 'general', 'greeting', 'hello', 'unread', NULL, NULL, '2026-10-31 16:29:04', NULL),
(4, 2, '', 'Books Issued', 'You have successfully borrowed 1 books: The Great Gatsby. Due date: 2026-11-14', 'unread', NULL, NULL, '2026-10-31 16:29:55', NULL),
(5, 2, 'general', 'Book Returned', 'You have successfully returned \'The Great Gatsby\'', 'unread', NULL, NULL, '2026-11-01 18:42:44', NULL),
(6, 11, '', 'Books Issued', 'You have successfully borrowed 1 books: The Great Gatsby. Due date: 2026-11-03', 'unread', NULL, NULL, '2026-11-02 12:53:23', NULL),
(7, 2, '', 'Books Issued', 'You have successfully borrowed 1 books: 1984. Due date: 2026-11-02', 'unread', NULL, NULL, '2026-11-02 12:54:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification_logs`
--

CREATE TABLE `notification_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(30) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL,
  `error_message` text DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `notification_logs`
--

INSERT INTO `notification_logs` (`id`, `user_id`, `type`, `recipient`, `subject`, `message`, `status`, `error_message`, `related_id`, `related_type`, `sent_at`) VALUES
(1, 1, 'in_app', '1', 'greeting', 'hello', 'sent', NULL, NULL, NULL, '2026-10-31 16:29:04'),
(2, 2, 'in_app', '2', 'greeting', 'hello', 'sent', NULL, NULL, NULL, '2026-10-31 16:29:04'),
(3, 3, 'in_app', '3', 'greeting', 'hello', 'sent', NULL, NULL, NULL, '2026-10-31 16:29:04');

-- --------------------------------------------------------

--
-- Table structure for table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `user_id` int(11) NOT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sms_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `push_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `due_reminder_days` varchar(100) NOT NULL DEFAULT '[3, 1]',
  `overdue_reminder_days` varchar(100) NOT NULL DEFAULT '[1, 3, 7]',
  `reservation_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `fine_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `general_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `notification_settings`
--

INSERT INTO `notification_settings` (`user_id`, `email_enabled`, `sms_enabled`, `push_enabled`, `due_reminder_days`, `overdue_reminder_days`, `reservation_notifications`, `fine_notifications`, `general_notifications`, `created_at`, `updated_at`) VALUES
(3, 1, 0, 1, '[3, 1]', '[1, 3, 7]', 1, 1, 1, '2026-10-31 12:51:23', '2026-10-31 12:51:23'),
(1, 1, 1, 1, '[3,1]', '[1,3,7]', 1, 1, 1, '2026-10-31 15:56:19', '2026-10-31 15:56:30'),
(10, 1, 0, 1, '[3, 1]', '[1, 3, 7]', 1, 1, 1, '2026-10-31 18:00:53', '2026-10-31 18:00:53'),
(2, 1, 0, 1, '[3, 1]', '[1, 3, 7]', 1, 1, 1, '2026-11-02 13:10:54', '2026-11-02 13:10:54');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `tx_ref` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fine_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'ETB',
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `chapa_reference` varchar(100) DEFAULT NULL,
  `checkout_url` text DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `chapa_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `payment_logs`
--

CREATE TABLE `payment_logs` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `tx_ref` varchar(100) NOT NULL,
  `event_type` enum('initialization','callback','verification','status_change','error') NOT NULL,
  `status_before` varchar(50) DEFAULT NULL,
  `status_after` varchar(50) DEFAULT NULL,
  `request_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'ETB',
  `purpose` enum('fine_payment','book_rental','membership_fee') NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `chapa_transaction_id` varchar(100) DEFAULT NULL,
  `callback_url` varchar(255) DEFAULT NULL,
  `return_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reading_goals`
--

CREATE TABLE `reading_goals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `goal_type` enum('yearly','monthly','weekly') NOT NULL,
  `target_books` int(11) NOT NULL,
  `current_progress` int(11) DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','completed','failed','paused') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reading_history`
--

CREATE TABLE `reading_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `progress_percentage` int(11) DEFAULT 0,
  `reading_time_minutes` int(11) DEFAULT 0,
  `last_page_read` int(11) DEFAULT 0,
  `status` enum('reading','completed','paused','abandoned') DEFAULT 'reading',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'system',
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `category`, `setting_key`, `setting_value`, `description`, `updated_at`, `updated_by`) VALUES
(1, 'library', 'libraryName', 'Digital Library Management System', NULL, '2026-10-31 16:59:21', NULL),
(2, 'library', 'description', 'A comprehensive digital library management solution', NULL, '2026-10-31 16:59:21', NULL),
(3, 'library', 'address', '123 Library Street, Education City', NULL, '2026-10-31 16:59:21', NULL),
(4, 'library', 'phone', '+1 (555) 123-4567', NULL, '2026-10-31 16:59:21', NULL),
(5, 'library', 'email', 'info@digitallibrary.com', NULL, '2026-10-31 16:59:21', NULL),
(6, 'library', 'website', 'https://tdigitallibrarysystem.free.nf/', NULL, '2026-10-31 16:59:21', NULL),
(7, 'library', 'operatingHours', '{\"monday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"tuesday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"wednesday\":{\"open\":\"10:18\",\"close\":\"20:00\",\"closed\":false},\"thursday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"friday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"saturday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"sunday\":{\"open\":\"10:00\",\"close\":\"16:00\",\"closed\":false}}', NULL, '2026-10-31 16:59:21', NULL),
(8, 'library', 'socialMedia', '{\"facebook\":\"https:\\/\\/facebook.com\\/digitallibrary\",\"twitter\":\"https:\\/\\/twitter.com\\/digitallibrary\",\"instagram\":\"https:\\/\\/instagram.com\\/digitallibrary\",\"linkedin\":\"https:\\/\\/linkedin.com\\/company\\/digitallibrary\"}', NULL, '2026-10-31 16:59:21', NULL),
(9, 'library_policies', 'max_user_borrow_books', '4', NULL, '2026-10-31 16:59:22', NULL),
(10, 'library_policies', 'due_fines_per_day', '100.5', NULL, '2026-10-31 16:59:22', NULL),
(11, 'library_policies', 'max_book_return_days', '1', NULL, '2026-10-31 16:59:22', NULL),
(12, 'notifications', 'emailEnabled', '1', NULL, '2026-10-31 16:43:10', NULL),
(13, 'notifications', 'smsEnabled', '1', NULL, '2026-10-31 16:43:10', NULL),
(14, 'notifications', 'pushEnabled', '1', NULL, '2026-10-31 16:43:10', NULL),
(15, 'notifications', 'overdueReminders', '1', NULL, '2026-10-31 16:43:10', NULL),
(16, 'notifications', 'systemAlerts', '1', NULL, '2026-10-31 16:43:10', NULL),
(17, 'notifications', 'reservationAlerts', '1', NULL, '2026-10-31 16:43:10', NULL),
(18, 'notifications', 'newBookNotifications', '1', NULL, '2026-10-31 16:43:10', NULL),
(19, 'notifications', 'emailTemplates', '{\"welcome\":\"Welcome to our Digital Library!\",\"overdue\":\"You have overdue books. Please return them.\",\"reservation\":\"Your reserved book is now available.\",\"renewal\":\"Your book loan has been renewed.\"}', NULL, '2026-10-31 16:43:10', NULL),
(20, 'notifications', 'notificationSchedule', '{\"overdueCheck\":\"09:00\",\"reservationCheck\":\"10:00\",\"dailyReport\":\"18:00\"}', NULL, '2026-10-31 16:43:10', NULL),
(21, 'super_admin', 'performance', '{\"caching_enabled\":true,\"auto_optimization\":true,\"debug_mode\":false,\"memory_limit_mb\":512,\"upload_max_size_mb\":50}', NULL, '2026-10-31 16:43:54', NULL),
(22, 'super_admin', 'security', '{\"two_factor_auth\":true,\"login_monitoring\":true,\"max_login_attempts\":6,\"session_timeout_minutes\":60,\"failed_login_alerts\":true}', NULL, '2026-10-31 16:43:54', NULL),
(23, 'super_admin', 'notifications', '{\"email_notifications\":true,\"system_alerts\":true,\"admin_email\":\"admin@digitallibrary.com\",\"cpu_usage_alert_threshold\":80}', NULL, '2026-10-31 16:43:54', NULL),
(24, 'super_admin', 'backup', '{\"automatic_backups\":true,\"backup_frequency\":\"daily\",\"backup_retention_days\":30,\"log_level\":\"info\"}', NULL, '2026-10-31 16:43:54', NULL),
(25, 'security', 'loginAttempts', '5', NULL, '2026-10-31 16:43:54', NULL),
(26, 'security', 'lockoutDuration', '30', NULL, '2026-10-31 16:43:54', NULL),
(27, 'security', 'auditLogging', '1', NULL, '2026-10-31 16:43:54', NULL),
(28, 'security', 'httpsOnly', '1', NULL, '2026-10-31 16:43:54', NULL),
(29, 'security', 'passwordExpiry', '90', NULL, '2026-10-31 16:43:54', NULL),
(30, 'security', 'sessionSecurity', '1', NULL, '2026-10-31 16:43:54', NULL),
(31, 'security', 'ipWhitelist', '[]', NULL, '2026-10-31 16:43:54', NULL),
(32, 'security', 'dataEncryption', '1', NULL, '2026-10-31 16:43:54', NULL),
(33, 'security', 'backupFrequency', 'daily', NULL, '2026-10-31 16:43:54', NULL),
(34, 'security', 'backupRetention', '30', NULL, '2026-10-31 16:43:54', NULL),
(35, 'security', 'apiRateLimit', '100', NULL, '2026-10-31 16:43:54', NULL),
(36, 'security', 'corsEnabled', '1', NULL, '2026-10-31 16:43:54', NULL),
(37, 'appearance', 'theme', 'dark', NULL, '2026-10-31 16:44:05', NULL),
(38, 'appearance', 'primaryColor', '#4a9b8e', NULL, '2026-10-31 16:44:05', NULL),
(39, 'appearance', 'secondaryColor', '#66bb6a', NULL, '2026-10-31 16:44:05', NULL),
(40, 'appearance', 'logo', '', NULL, '2026-10-31 16:44:05', NULL),
(41, 'appearance', 'favicon', '', NULL, '2026-10-31 16:44:05', NULL),
(42, 'appearance', 'customCSS', '', NULL, '2026-10-31 16:44:05', NULL),
(43, 'appearance', 'showBranding', 'true', NULL, '2026-10-31 16:44:05', NULL),
(44, 'appearance', 'compactMode', 'false', NULL, '2026-10-31 16:44:05', NULL),
(45, 'appearance', 'animationsEnabled', 'true', NULL, '2026-10-31 16:44:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','librarian','user','super-admin') DEFAULT 'user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_id`, `full_name`, `email`, `phone`, `address`, `password_hash`, `role`, `status`, `profile_image`, `created_at`, `updated_at`, `last_login`, `google_id`) VALUES
(1, 'USR001', 'Tesfaye Abera Lingane', 'tesfayeaberalingane@gmail.com', NULL, NULL, '', 'user', 'active', 'https://lh3.googleusercontent.com/a/ACg8ocLMXVXB1momwAYnY1ejQtev9slPoX3MBGbLIa7E7jfzZ_YAQW-n=s96-c', '2026-10-31 12:31:51', '2026-11-02 14:36:07', '2026-11-02 14:36:07', '111287545140580667173'),
(2, 'USR002', 'Tesfaye', 'tesfasoftware12@gmail.com', NULL, NULL, '', 'user', 'active', 'https://lh3.googleusercontent.com/a/ACg8ocLkcMxMTrgtt_QB8Fq6wj_gJ8oemwdpXjg0-_3JgwS8Lg8pBg=s96-c', '2026-10-31 12:37:57', '2026-11-02 14:41:14', '2026-11-02 14:41:14', '112839402351851719207'),
(3, 'USR003', 'tesfaye', 'tesfayeaberalinganel@gmail.com', '0956422577', '123456', '$argon2id$v=19$m=65536,t=4,p=1$VjRVSmUxd0JNMy5ydXVsUw$m+62KKZb6t4D/sE4gD1OC0suMoM1mfEgxGaEYo8f7ck', 'user', 'active', 'uploads/profile_images/user_3_1793451159.jpg', '2026-10-31 12:41:27', '2026-10-31 12:52:40', '2026-10-31 12:41:51', NULL),
(4, 'USR004', 'Tesfaye', 'tesfaye@gmail.com', '0956422577', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$ZXVpWVZoSUplSy91Ty9ISw$3jY1WJj+h8r6UmBDe89Rq1VACW6GXlfoOY9aXy4JRF0', 'super-admin', 'active', NULL, '2026-10-31 16:18:50', '2026-10-31 16:54:42', '2026-10-31 16:54:42', NULL),
(5, 'USR005', 'Abraham', 'abraham@gmail.com', '0956422578', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$ajRWdEhwWDZrbENGYmpJLg$wCYObPFfIRFwpqGTxvDqcFOtGEpV1Mq8k5cRfFEctV0', 'admin', 'active', NULL, '2026-10-31 16:19:47', '2026-10-31 16:58:25', '2026-10-31 16:58:25', NULL),
(6, 'USR006', 'Tagesse', 'tagesse@gmail.com', '0956422578', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$aFZCNElRRHJOekVIRWJjVQ$mFaDWW9MILHNpAV/8kJ8tYzZpoHkw10EjOB89hJMZ0s', 'admin', 'active', NULL, '2026-10-31 16:20:38', '2026-10-31 16:25:37', NULL, NULL),
(7, 'USR007', 'Kidist', 'kidist@gmail.com', '0956422570', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$V3B0ZkdjMjFBSHdVTlAydQ$M4AafTstCToY4x/sy6cWSTHl61g8ETxYSuOah0FyYY4', 'librarian', 'active', NULL, '2026-10-31 16:21:32', '2026-11-02 14:37:19', '2026-11-02 14:37:19', NULL),
(8, 'USR008', 'Mekibib', 'mekibib@gmail.com', '0956422577', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$YzBBUlJrZmpteXVSZ0pROA$f2rhuLXWmjrpk1OhTUL8dvVIED4D7+UyETrNvCYYFag', 'librarian', 'active', NULL, '2026-10-31 16:22:16', '2026-10-31 17:06:16', '2026-10-31 17:06:16', NULL),
(9, 'USR009', 'Tewodros', 'tewodros@gmail.com', '0956422577', 'hossana', '$argon2id$v=19$m=65536,t=4,p=1$elZ2dnJMb0FoQzJsdGl1Zg$RtEggGiCAdYIPajIUTBZW5Fd1LlMbVj6tn9MBdhvnco', 'librarian', 'active', NULL, '2026-10-31 16:23:09', '2026-11-01 17:15:52', '2026-11-01 17:15:52', NULL),
(10, 'USR010', 'Tesfaye Abera', 'tesfayelingane@gmail.com', NULL, NULL, '', 'user', 'active', 'uploads/profile_images/user_10_1793469756.jpg', '2026-10-31 17:53:35', '2026-10-31 18:02:38', '2026-10-31 17:53:35', '106093329775984001240'),
(11, 'USR011', 'Tesfaye', 'tesfayesoftware1221@gmail.com', NULL, NULL, '', 'user', 'active', 'https://lh3.googleusercontent.com/a/ACg8ocKF--pAiWrGfqsBBjlma1NeGU5usJWjoLMPRWPqGlJe-SCllA=s96-c', '2026-11-01 17:18:36', '2026-11-01 17:18:36', '2026-11-01 17:18:36', '101174842140506470681');

-- --------------------------------------------------------

--
-- Table structure for table `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `earned_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

CREATE TABLE `user_favorites` (
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user_favorites`
--

INSERT INTO `user_favorites` (`user_id`, `book_id`, `created_at`) VALUES
(3, 4, '2026-10-31 12:49:01'),
(1, 1, '2026-10-31 15:55:46'),
(1, 2, '2026-10-31 15:55:49'),
(2, 5, '2026-11-02 12:33:57'),
(10, 4, '2026-10-31 18:03:03'),
(2, 2, '2026-11-02 12:56:48'),
(2, 1, '2026-11-02 14:07:23'),
(1, 3, '2026-11-02 14:34:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `idx_isbn` (`isbn`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `book_branch_inventory`
--
ALTER TABLE `book_branch_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_book_branch` (`book_id`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `book_loans`
--
ALTER TABLE `book_loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `returned_to` (`returned_to`),
  ADD KEY `idx_user_loan` (`user_id`),
  ADD KEY `idx_book_loan` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_book_id` (`book_id`);

--
-- Indexes for table `book_reservations`
--
ALTER TABLE `book_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_reservation` (`user_id`),
  ADD KEY `idx_book_reservation` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_queue` (`queue_position`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `idx_user_fine` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_date` (`payment_date`);

--
-- Indexes for table `library_branches`
--
ALTER TABLE `library_branches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_ip` (`ip_address`),
  ADD KEY `idx_attempted_at` (`attempted_at`),
  ADD KEY `idx_success` (`success`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_messages_sender_thread` (`sender_id`,`receiver_id`,`id`),
  ADD KEY `idx_messages_receiver_thread` (`receiver_id`,`sender_id`,`id`),
  ADD KEY `idx_messages_unread` (`receiver_id`,`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_notification` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notification_log_user` (`user_id`),
  ADD KEY `idx_notification_log_type` (`type`),
  ADD KEY `idx_notification_log_status` (`status`),
  ADD KEY `idx_notification_log_sent_at` (`sent_at`);

--
-- Indexes for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_reference` (`transaction_reference`),
  ADD KEY `idx_user_payment` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reference` (`transaction_reference`);

--
-- Indexes for table `reading_goals`
--
ALTER TABLE `reading_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_goal` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `reading_history`
--
ALTER TABLE `reading_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_history` (`user_id`),
  ADD KEY `idx_book_history` (`book_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_setting` (`category`,`setting_key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  ADD KEY `achievement_id` (`achievement_id`);

--
-- Indexes for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`user_id`,`book_id`),
  ADD KEY `idx_user_favorites_book` (`book_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `book_branch_inventory`
--
ALTER TABLE `book_branch_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_loans`
--
ALTER TABLE `book_loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `book_reservations`
--
ALTER TABLE `book_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `book_reviews`
--
ALTER TABLE `book_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_branches`
--
ALTER TABLE `library_branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_logs`
--
ALTER TABLE `payment_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reading_goals`
--
ALTER TABLE `reading_goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reading_history`
--
ALTER TABLE `reading_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_achievements`
--
ALTER TABLE `user_achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
