-- Database Backup Created: 2026-05-16 12:17:26
-- Database: digital_library

-- Table: achievements
DROP TABLE IF EXISTS `achievements`;
Create Table;

-- Data for table achievements
INSERT INTO `achievements` VALUES ('1', 'Bookworm', 'Read 10 books', 'book-icon', 'books_read', '10', '100', '2026-05-05 01:13:39');
INSERT INTO `achievements` VALUES ('2', 'Speed Reader', 'Finish 5 books in a month', 'speed-icon', 'books_read', '5', '150', '2026-05-05 01:13:39');
INSERT INTO `achievements` VALUES ('3', 'Diverse Reader', 'Read from 5 different categories', 'diversity-icon', 'books_read', '5', '200', '2026-05-05 01:13:39');
INSERT INTO `achievements` VALUES ('4', 'Reviewer', 'Write 20 reviews', 'review-icon', 'reviews_written', '20', '75', '2026-05-05 01:13:39');

-- Table: audit_logs
DROP TABLE IF EXISTS `audit_logs`;
Create Table;

-- Data for table audit_logs
INSERT INTO `audit_logs` VALUES ('1', '5', 'return_book', 'book_loans', '8', NULL, NULL, '::1', NULL, '2026-05-06 14:50:49');
INSERT INTO `audit_logs` VALUES ('2', '5', 'return_book', 'book_loans', '10', NULL, NULL, '::1', NULL, '2026-05-06 14:51:22');
INSERT INTO `audit_logs` VALUES ('3', '5', 'renew_book', 'book_loans', '9', NULL, NULL, '::1', NULL, '2026-05-06 15:03:19');
INSERT INTO `audit_logs` VALUES ('4', '5', 'renew_book', 'book_loans', '20', NULL, NULL, '::1', NULL, '2026-05-06 15:07:31');
INSERT INTO `audit_logs` VALUES ('5', '5', 'renew_book', 'book_loans', '21', NULL, NULL, '::1', NULL, '2026-05-07 01:12:06');
INSERT INTO `audit_logs` VALUES ('6', '2', 'return_book', 'book_loans', '22', NULL, NULL, '::1', NULL, '2026-05-07 00:28:09');
INSERT INTO `audit_logs` VALUES ('7', '2', 'return_book', 'book_loans', '4', NULL, NULL, '::1', NULL, '2026-05-07 00:45:56');
INSERT INTO `audit_logs` VALUES ('8', '2', 'return_book', 'book_loans', '14', NULL, NULL, '::1', NULL, '2026-05-07 00:48:11');
INSERT INTO `audit_logs` VALUES ('9', '2', 'update_book', 'books', '1', NULL, NULL, '::1', NULL, '2026-05-07 01:20:15');
INSERT INTO `audit_logs` VALUES ('10', '2', 'create_book', 'books', '9', NULL, NULL, '::1', NULL, '2026-05-07 01:36:03');
INSERT INTO `audit_logs` VALUES ('11', '2', 'update_book', 'books', '9', NULL, NULL, '::1', NULL, '2026-05-07 01:36:20');
INSERT INTO `audit_logs` VALUES ('12', '2', 'delete_book', 'books', '9', NULL, NULL, '::1', NULL, '2026-05-07 01:36:42');
INSERT INTO `audit_logs` VALUES ('13', '2', 'create_book', 'books', '10', NULL, NULL, '::1', NULL, '2026-05-07 01:40:32');
INSERT INTO `audit_logs` VALUES ('14', '2', 'delete_book', 'books', '10', NULL, NULL, '::1', NULL, '2026-05-07 01:42:58');
INSERT INTO `audit_logs` VALUES ('15', '2', 'create_book', 'books', '11', NULL, NULL, '::1', NULL, '2026-05-07 01:52:43');
INSERT INTO `audit_logs` VALUES ('16', '2', 'delete_book', 'books', '11', NULL, NULL, '::1', NULL, '2026-05-07 01:52:54');
INSERT INTO `audit_logs` VALUES ('17', '12', 'return_book', 'book_loans', '15', NULL, NULL, '::1', NULL, '2026-05-07 06:19:10');
INSERT INTO `audit_logs` VALUES ('18', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-07 06:55:06');
INSERT INTO `audit_logs` VALUES ('19', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-07 06:57:28');
INSERT INTO `audit_logs` VALUES ('20', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-07 07:06:17');
INSERT INTO `audit_logs` VALUES ('21', '2', 'send_manual_notifications', 'notifications', NULL, NULL, '{\"type\":\"due_reminder\",\"recipients_count\":10,\"sent_count\":4,\"failed_count\":6,\"custom_subject\":\"ok\",\"custom_message\":\"ok\"}', '::1', NULL, '2026-05-07 07:07:01');
INSERT INTO `audit_logs` VALUES ('22', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-08 14:32:32');
INSERT INTO `audit_logs` VALUES ('23', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-08 14:32:41');
INSERT INTO `audit_logs` VALUES ('24', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-08 14:34:33');
INSERT INTO `audit_logs` VALUES ('25', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-08 14:34:34');
INSERT INTO `audit_logs` VALUES ('26', '2', 'run_notification_scheduler', 'notifications', NULL, NULL, '{\"results\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"triggered_by\":\"manual\",\"user_id\":\"2\"}', '::1', NULL, '2026-05-08 14:44:43');
INSERT INTO `audit_logs` VALUES ('27', '2', 'send_manual_notifications', 'notifications', NULL, NULL, '{\"type\":\"general\",\"recipients_count\":9,\"sent_count\":9,\"failed_count\":0,\"custom_subject\":\"ok this is new\",\"custom_message\":\"okkkkkkkkkkkkkkkkkkkk\"}', '::1', NULL, '2026-05-08 15:23:34');

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
INSERT INTO `book_loans` VALUES ('1', '4', '1', '2026-04-20', '2026-05-20', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37');
INSERT INTO `book_loans` VALUES ('2', '4', '2', '2026-04-25', '2026-05-25', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37');
INSERT INTO `book_loans` VALUES ('3', '5', '3', '2026-03-15', '2026-04-15', NULL, 'overdue', '0', '0.00', NULL, '2', NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37');
INSERT INTO `book_loans` VALUES ('4', '6', '1', '2026-04-01', '2026-05-01', '2026-05-06', 'returned', '0', '0.00', NULL, '3', '2', '2026-05-05 01:13:37', '2026-05-07 00:45:55');
INSERT INTO `book_loans` VALUES ('5', '7', '4', '2026-04-10', '2026-05-10', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37');
INSERT INTO `book_loans` VALUES ('6', '5', '1', '2026-05-05', '2026-05-19', '2026-05-06', 'returned', '0', '0.00', NULL, '5', '5', '2026-05-05 19:24:35', '2026-05-06 14:47:12');
INSERT INTO `book_loans` VALUES ('7', '5', '2', '2026-05-05', '2026-05-19', '2026-05-06', 'returned', '0', '0.00', NULL, '5', '5', '2026-05-05 19:24:49', '2026-05-06 14:48:56');
INSERT INTO `book_loans` VALUES ('8', '5', '4', '2026-05-05', '2026-05-19', '2026-05-06', 'returned', '0', '0.00', NULL, '5', '5', '2026-05-05 19:27:04', '2026-05-06 14:50:48');
INSERT INTO `book_loans` VALUES ('9', '5', '3', '2026-05-05', '2026-06-02', NULL, 'renewed', '1', '0.00', NULL, '5', NULL, '2026-05-05 19:27:08', '2026-05-06 15:03:19');
INSERT INTO `book_loans` VALUES ('10', '5', '5', '2026-05-05', '2026-05-19', '2026-05-06', 'returned', '0', '0.00', NULL, '5', '5', '2026-05-05 19:27:13', '2026-05-06 14:51:22');
INSERT INTO `book_loans` VALUES ('11', '12', '1', '2026-05-05', '2026-05-19', NULL, 'active', '0', '0.00', NULL, '12', NULL, '2026-05-05 19:33:12', '2026-05-05 19:33:12');
INSERT INTO `book_loans` VALUES ('12', '12', '2', '2026-05-05', '2026-05-19', NULL, 'active', '0', '0.00', NULL, '12', NULL, '2026-05-05 19:34:08', '2026-05-05 19:34:08');
INSERT INTO `book_loans` VALUES ('13', '12', '3', '2026-05-05', '2026-05-19', NULL, 'active', '0', '0.00', NULL, '12', NULL, '2026-05-05 19:37:23', '2026-05-05 19:37:23');
INSERT INTO `book_loans` VALUES ('14', '12', '4', '2026-05-05', '2026-05-19', '2026-05-06', 'returned', '0', '0.00', NULL, '12', '2', '2026-05-05 19:37:29', '2026-05-07 00:48:11');
INSERT INTO `book_loans` VALUES ('15', '12', '5', '2026-05-05', '2026-05-19', '2026-05-07', 'returned', '0', '0.00', NULL, '12', '12', '2026-05-05 19:37:33', '2026-05-07 06:19:10');
INSERT INTO `book_loans` VALUES ('16', '13', '3', '2026-05-05', '2026-05-19', NULL, 'active', '0', '0.00', NULL, '13', NULL, '2026-05-05 19:47:09', '2026-05-05 19:47:09');
INSERT INTO `book_loans` VALUES ('17', '13', '1', '2026-05-05', '2026-05-19', NULL, 'active', '0', '0.00', NULL, '13', NULL, '2026-05-05 19:47:29', '2026-05-05 19:47:29');
INSERT INTO `book_loans` VALUES ('18', '13', '5', '2026-05-06', '2026-05-20', NULL, 'active', '0', '0.00', NULL, '13', NULL, '2026-05-06 07:20:08', '2026-05-06 07:20:08');
INSERT INTO `book_loans` VALUES ('19', '13', '7', '2026-05-06', '2026-05-20', NULL, 'active', '0', '0.00', NULL, '13', NULL, '2026-05-06 07:20:17', '2026-05-06 07:20:17');
INSERT INTO `book_loans` VALUES ('20', '5', '4', '2026-05-06', '2026-06-03', NULL, 'renewed', '1', '0.00', NULL, '5', NULL, '2026-05-06 15:07:16', '2026-05-06 15:07:30');
INSERT INTO `book_loans` VALUES ('21', '5', '6', '2026-05-07', '2026-06-04', NULL, 'renewed', '1', '0.00', NULL, '5', NULL, '2026-05-07 01:11:40', '2026-05-07 01:12:06');
INSERT INTO `book_loans` VALUES ('22', '5', '2', '2026-05-07', '2026-05-21', '2026-05-06', 'returned', '0', '0.00', NULL, '5', '2', '2026-05-07 01:12:28', '2026-05-07 00:28:08');
INSERT INTO `book_loans` VALUES ('23', '5', '8', '2026-05-07', '2026-05-21', NULL, 'active', '0', '0.00', NULL, '5', NULL, '2026-05-07 01:22:28', '2026-05-07 01:22:28');
INSERT INTO `book_loans` VALUES ('24', '5', '4', '2026-05-07', '2026-05-20', NULL, 'active', '0', '0.00', NULL, '5', NULL, '2026-05-07 00:49:07', '2026-05-07 00:49:07');
INSERT INTO `book_loans` VALUES ('25', '2', '1', '2026-05-07', '2026-05-21', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-07 04:14:53', '2026-05-07 04:14:53');
INSERT INTO `book_loans` VALUES ('26', '2', '5', '2026-05-07', '2026-05-17', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-07 04:17:27', '2026-05-07 04:17:27');
INSERT INTO `book_loans` VALUES ('27', '4', '5', '2026-04-15', '2026-05-15', '2026-04-28', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:47', '2026-05-08 16:02:47');
INSERT INTO `book_loans` VALUES ('28', '5', '6', '2026-04-18', '2026-05-18', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:47', '2026-05-08 16:02:47');
INSERT INTO `book_loans` VALUES ('29', '6', '7', '2026-04-20', '2026-05-20', '2026-05-02', 'returned', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('30', '7', '8', '2026-04-22', '2026-05-22', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('31', '8', '1', '2026-04-25', '2026-05-25', NULL, 'active', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('32', '4', '2', '2026-04-28', '2026-05-28', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('33', '5', '3', '2026-05-01', '2026-05-31', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('34', '6', '4', '2026-05-03', '2026-06-02', NULL, 'active', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('35', '7', '5', '2026-05-05', '2026-06-04', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('36', '8', '6', '2026-05-07', '2026-06-06', NULL, 'active', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('37', '4', '7', '2026-04-10', '2026-05-10', '2026-04-25', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('38', '5', '8', '2026-04-12', '2026-05-12', '2026-04-27', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('39', '6', '1', '2026-04-14', '2026-05-14', '2026-04-29', 'returned', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('40', '7', '2', '2026-04-16', '2026-05-16', '2026-05-01', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:48', '2026-05-08 16:02:48');
INSERT INTO `book_loans` VALUES ('41', '8', '3', '2026-04-18', '2026-05-18', '2026-05-03', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('42', '4', '4', '2026-04-20', '2026-05-20', '2026-05-05', 'returned', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('43', '5', '5', '2026-04-22', '2026-05-22', '2026-05-07', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('44', '6', '6', '2026-04-21', '2026-05-21', '2026-05-06', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('45', '7', '7', '2026-04-22', '2026-05-22', '2026-05-07', 'returned', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('46', '8', '8', '2026-04-23', '2026-05-23', '2026-05-08', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('47', '4', '1', '2026-04-24', '2026-05-24', '2026-05-09', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('48', '5', '2', '2026-04-25', '2026-05-25', '2026-05-10', 'returned', '0', '0.00', NULL, '3', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('49', '6', '3', '2026-04-26', '2026-05-26', '2026-05-11', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('50', '7', '4', '2026-04-27', '2026-05-27', '2026-05-12', 'returned', '0', '0.00', NULL, '2', NULL, '2026-05-08 16:02:49', '2026-05-08 16:02:49');
INSERT INTO `book_loans` VALUES ('51', '5', '5', '2026-05-11', '2026-06-08', NULL, 'active', '0', '0.00', NULL, '5', NULL, '2026-05-11 13:30:07', '2026-05-11 13:30:07');
INSERT INTO `book_loans` VALUES ('52', '24', '12', '2026-05-11', '2026-06-08', NULL, 'active', '0', '0.00', NULL, '24', NULL, '2026-05-11 13:37:31', '2026-05-11 13:37:31');
INSERT INTO `book_loans` VALUES ('53', '25', '8', '2026-05-15', '2026-06-12', NULL, 'active', '0', '0.00', NULL, '25', NULL, '2026-05-15 18:36:08', '2026-05-15 18:36:08');
INSERT INTO `book_loans` VALUES ('54', '24', '13', '2026-05-15', '2026-06-12', NULL, 'active', '0', '0.00', NULL, '24', NULL, '2026-05-15 18:55:43', '2026-05-15 18:55:43');

-- Table: book_reservations
DROP TABLE IF EXISTS `book_reservations`;
Create Table;

-- Data for table book_reservations
INSERT INTO `book_reservations` VALUES ('1', '7', '2', '2026-05-05 01:13:38', 'available', '1', NULL, '0', '2026-05-05 01:13:38', '2026-05-06 14:48:56');
INSERT INTO `book_reservations` VALUES ('2', '8', '1', '2026-05-05 01:13:38', 'available', '2', NULL, '0', '2026-05-05 01:13:38', '2026-05-06 14:47:13');
INSERT INTO `book_reservations` VALUES ('3', '13', '2', '2026-05-06 07:20:22', 'available', NULL, NULL, '0', '2026-05-06 07:20:22', '2026-05-07 00:28:09');
INSERT INTO `book_reservations` VALUES ('4', '5', '5', '2026-05-07 06:17:39', 'available', NULL, NULL, '0', '2026-05-07 06:17:39', '2026-05-07 06:19:10');

-- Table: book_reviews
DROP TABLE IF EXISTS `book_reviews`;
Create Table;

-- Data for table book_reviews
INSERT INTO `book_reviews` VALUES ('1', '4', '1', '5', 'An absolutely brilliant novel! Fitzgerald\'s writing is mesmerizing.', 'approved', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `book_reviews` VALUES ('2', '5', '2', '4', 'A thought-provoking dystopian masterpiece. Highly recommended.', 'approved', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `book_reviews` VALUES ('3', '6', '3', '5', 'A timeless classic that everyone should read. Powerful and moving.', 'approved', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `book_reviews` VALUES ('4', '7', '4', '4', 'Austen\'s wit and social commentary are exceptional.', 'approved', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `book_reviews` VALUES ('5', '4', '6', '5', 'Huxley\'s vision of the future is both fascinating and terrifying.', 'approved', '2026-05-05 01:13:38', '2026-05-05 01:13:38');

-- Table: books
DROP TABLE IF EXISTS `books`;
Create Table;

-- Data for table books
INSERT INTO `books` VALUES ('1', '978-0-7432-7356-5', 'The Great Gatsb', 'F. Scott Fitzgerald', 'Scribner', '1925', '1', 'A classic American novel set in the Jazz Age', NULL, '5', '1', '180', 'English', NULL, 'physical', '15.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-07 04:55:46');
INSERT INTO `books` VALUES ('2', '978-0-452-28423-4', '1984', 'George Orwell', 'Penguin Books', '1949', '1', 'A dystopian social science fiction novel', NULL, '8', '1', '328', 'English', NULL, 'physical', '13.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-07 00:28:08');
INSERT INTO `books` VALUES ('3', '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', '1960', '1', 'A novel about racial injustice and childhood in the American South', NULL, '6', '1', '376', 'English', NULL, 'physical', '14.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-05 19:47:09');
INSERT INTO `books` VALUES ('4', '978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', '0000', '7', 'A romantic novel of manners', NULL, '4', '2', '432', 'English', NULL, 'physical', '12.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-07 00:49:07');
INSERT INTO `books` VALUES ('5', '978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', '1951', '1', 'A controversial novel about teenage rebellion', NULL, '3', '0', '277', 'English', NULL, 'physical', '16.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-11 13:30:07');
INSERT INTO `books` VALUES ('6', '978-0-06-085052-4', 'Brave New World', 'Aldous Huxley', 'Harper Perennial', '1932', '2', 'A dystopian novel about a technologically advanced future society', NULL, '5', '4', '311', 'English', NULL, 'physical', '15.49', 'active', 'good', '2026-05-05 01:13:37', '2026-05-07 01:11:40');
INSERT INTO `books` VALUES ('7', '978-0-7432-7357-2', 'Moby Dick', 'Herman Melville', 'Scribner', '0000', '1', 'The epic tale of Captain Ahab and the white whale', NULL, '3', '2', '635', 'English', NULL, 'physical', '18.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-06 07:20:17');
INSERT INTO `books` VALUES ('8', '978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien', 'Houghton Mifflin', '1937', '1', 'A fantasy adventure novel', NULL, '7', '4', '310', 'English', NULL, 'physical', '14.99', 'active', 'good', '2026-05-05 01:13:37', '2026-05-15 18:36:08');
INSERT INTO `books` VALUES ('12', '978-1234567890', 'Sample Book Title', 'John Doe', 'Sample Publisher', '2024', '1', 'A sample book description', NULL, '5', '4', '200', 'English', NULL, 'physical', '0.00', 'active', 'poor', '2026-05-07 05:07:23', '2026-05-11 13:37:31');
INSERT INTO `books` VALUES ('13', '978-0987654321', 'Another Book', 'Jane Smith', 'Another Publisher', '2023', '2', 'Another book description', NULL, '3', '2', '150', 'English', NULL, 'physical', '0.00', 'active', 'good', '2026-05-07 05:07:23', '2026-05-15 18:55:43');

-- Table: categories
DROP TABLE IF EXISTS `categories`;
Create Table;

-- Data for table categories
INSERT INTO `categories` VALUES ('1', 'Fiction', 'Fictional literature including novels and short stories', '#9b59b6', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('2', 'Science', 'Scientific books and research materials', '#3498db', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('3', 'Academic', 'Academic textbooks and educational materials', '#e74c3c', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('4', 'History', 'Historical books and documentaries', '#f39c12', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('5', 'Technology', 'Technology, programming, and computer science books', '#2ecc71', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('6', 'Arts', 'Art, music, and creative literature', '#e91e63', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('7', 'Romance', 'Romance novels and love stories', '#ff6b9d', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('8', 'Journals', 'Academic journals and periodicals', '#34495e', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('9', 'Photography', 'Photography books and visual arts', '#fd79a8', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('10', 'Music', 'Music theory, history, and biographies', '#6c5ce7', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('11', 'Gaming', 'Gaming guides and industry books', '#a29bfe', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('12', 'Business', 'Business, economics, and management books', '#00b894', '2026-05-05 01:13:37');
INSERT INTO `categories` VALUES ('52', 'Children', 'Children books', '#1abc9c', '2026-05-07 01:34:48');

-- Table: fines
DROP TABLE IF EXISTS `fines`;
Create Table;

-- Data for table fines
INSERT INTO `fines` VALUES ('1', '5', '3', 'overdue', '15.00', 'Book overdue by 30 days', 'pending', '0.00', NULL, NULL, NULL, '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `fines` VALUES ('2', '8', NULL, 'damage', '25.00', 'Book returned with water damage', 'paid', '0.00', NULL, NULL, NULL, '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `fines` VALUES ('3', '6', '4', 'overdue', '25.00', 'Overdue return', 'pending', '0.00', NULL, NULL, NULL, '2026-05-07 00:45:56', '2026-05-07 00:45:56');
INSERT INTO `fines` VALUES ('4', '4', '1', 'overdue', '12.50', 'Late return fine', 'paid', '12.50', NULL, NULL, NULL, '2026-04-28 10:00:00', '2026-05-08 16:02:49');
INSERT INTO `fines` VALUES ('5', '5', '2', 'overdue', '8.00', 'Late return fine', 'paid', '8.00', NULL, NULL, NULL, '2026-05-01 11:00:00', '2026-05-08 16:02:49');
INSERT INTO `fines` VALUES ('6', '6', '3', 'damage', '25.00', 'Book cover damage', 'paid', '25.00', NULL, NULL, NULL, '2026-05-03 15:00:00', '2026-05-08 16:02:49');
INSERT INTO `fines` VALUES ('7', '7', '4', 'overdue', '15.50', 'Late return fine', 'pending', '0.00', NULL, NULL, NULL, '2026-05-05 12:00:00', '2026-05-08 16:02:49');
INSERT INTO `fines` VALUES ('8', '8', '5', 'lost', '45.00', 'Lost book replacement', 'pending', '0.00', NULL, NULL, NULL, '2026-05-07 14:00:00', '2026-05-08 16:02:49');

-- Table: library_branches
DROP TABLE IF EXISTS `library_branches`;
Create Table;

-- Data for table library_branches
INSERT INTO `library_branches` VALUES ('1', 'Main Library', '123 Library Street, Downtown, City 12345', '+1-555-LIBRARY', 'main@digitallibrary.com', '2', 'active', '2026-05-05 01:13:39');
INSERT INTO `library_branches` VALUES ('2', 'North Branch', '456 North Ave, Northside, City 12346', '+1-555-NORTH', 'north@digitallibrary.com', '3', 'active', '2026-05-05 01:13:39');

-- Table: login_attempts
DROP TABLE IF EXISTS `login_attempts`;
Create Table;

-- Table: notification_logs
DROP TABLE IF EXISTS `notification_logs`;
Create Table;

-- Data for table notification_logs
INSERT INTO `notification_logs` VALUES ('1', 'email', 'bob.johnson@example.com', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 06:51:26', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('2', 'sms', '+1-555-9012', NULL, 'Library: \'Pride and Prejudice\' due in 3 days (May 10). Please return on time.', 'sent', NULL, '2026-05-07 06:51:26', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('3', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":5.53,\"stats\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-07 07:51:28\"}', 'sent', NULL, '2026-05-07 06:51:28', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('4', 'email', 'bob.johnson@example.com', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 06:55:06', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('5', 'sms', '+1-555-9012', NULL, 'Library: \'Pride and Prejudice\' due in 3 days (May 10). Please return on time.', 'sent', NULL, '2026-05-07 06:55:06', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('6', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":2.07,\"stats\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-07 05:55:06\"}', 'sent', NULL, '2026-05-07 06:55:06', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('7', 'email', 'bob.johnson@example.com', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 06:57:27', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('8', 'sms', '+1-555-9012', NULL, 'Library: \'Pride and Prejudice\' due in 3 days (May 10). Please return on time.', 'sent', NULL, '2026-05-07 06:57:27', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('9', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":1.88,\"stats\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-07 05:57:28\"}', 'sent', NULL, '2026-05-07 06:57:28', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('10', 'email', 'bob.johnson@example.com', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:16', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('11', 'sms', '+1-555-9012', NULL, 'Library: \'Pride and Prejudice\' due in 3 days (May 10). Please return on time.', 'sent', NULL, '2026-05-07 07:06:16', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('12', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":1.75,\"stats\":{\"due_reminders\":1,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-07 06:06:17\"}', 'sent', NULL, '2026-05-07 07:06:17', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('13', 'email', 'john.doe@example.com', '???? Book Due Reminder - 14 days remaining', 'Hi John Doe, your book \'The Hobbit\' by J.R.R. Tolkien is due in 14 days on May 21, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:46', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('14', 'sms', '+251911234567', NULL, 'Library: \'The Hobbit\' due in 14 days (May 21). Please return on time.', 'sent', NULL, '2026-05-07 07:06:47', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('15', 'email', 'john.doe@example.com', '???? Book Due Reminder - 13 days remaining', 'Hi John Doe, your book \'Pride and Prejudice\' by Jane Austen is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:48', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('16', 'sms', '+251911234567', NULL, 'Library: \'Pride and Prejudice\' due in 13 days (May 20). Please return on time.', 'sent', NULL, '2026-05-07 07:06:48', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('17', 'email', 'bob.johnson@example.com', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:49', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('18', 'sms', '+1-555-9012', NULL, 'Library: \'Pride and Prejudice\' due in 3 days (May 10). Please return on time.', 'sent', NULL, '2026-05-07 07:06:49', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('19', 'email', 'tesfa@gmail.com', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'The Great Gatsb\' by F. Scott Fitzgerald is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:51', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('20', 'sms', '+251911234567', NULL, 'Library: \'The Great Gatsb\' due in 12 days (May 19). Please return on time.', 'sent', NULL, '2026-05-07 07:06:51', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('21', 'email', 'tesfa@gmail.com', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'1984\' by George Orwell is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:53', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('22', 'sms', '+251911234567', NULL, 'Library: \'1984\' due in 12 days (May 19). Please return on time.', 'sent', NULL, '2026-05-07 07:06:53', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('23', 'email', 'tesfa@gmail.com', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'To Kill a Mockingbird\' by Harper Lee is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:55', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('24', 'sms', '+251911234567', NULL, 'Library: \'To Kill a Mockingbird\' due in 12 days (May 19). Please return on time.', 'sent', NULL, '2026-05-07 07:06:55', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('25', 'email', 'tr@gmail.com', '???? Book Due Reminder - 12 days remaining', 'Hi tr, your book \'To Kill a Mockingbird\' by Harper Lee is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:57', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('26', 'sms', '+251911234567', NULL, 'Library: \'To Kill a Mockingbird\' due in 12 days (May 19). Please return on time.', 'sent', NULL, '2026-05-07 07:06:57', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('27', 'email', 'tr@gmail.com', '???? Book Due Reminder - 12 days remaining', 'Hi tr, your book \'The Great Gatsb\' by F. Scott Fitzgerald is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:58', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('28', 'sms', '+251911234567', NULL, 'Library: \'The Great Gatsb\' due in 12 days (May 19). Please return on time.', 'sent', NULL, '2026-05-07 07:06:58', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('29', 'email', 'tr@gmail.com', '???? Book Due Reminder - 13 days remaining', 'Hi tr, your book \'The Catcher in the Rye\' by J.D. Salinger is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:06:59', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('30', 'sms', '+251911234567', NULL, 'Library: \'The Catcher in the Rye\' due in 13 days (May 20). Please return on time.', 'sent', NULL, '2026-05-07 07:06:59', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('31', 'email', 'tr@gmail.com', '???? Book Due Reminder - 13 days remaining', 'Hi tr, your book \'Moby Dick\' by Herman Melville is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-07 07:07:00', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('32', 'sms', '+251911234567', NULL, 'Library: \'Moby Dick\' due in 13 days (May 20). Please return on time.', 'sent', NULL, '2026-05-07 07:07:01', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('33', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":0.14,\"stats\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-08 13:32:32\"}', 'sent', NULL, '2026-05-08 14:32:32', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('34', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":0.02,\"stats\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-08 13:32:41\"}', 'sent', NULL, '2026-05-08 14:32:41', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('35', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":0.02,\"stats\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-08 13:34:32\"}', 'sent', NULL, '2026-05-08 14:34:32', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('36', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":0.02,\"stats\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-08 13:34:34\"}', 'sent', NULL, '2026-05-08 14:34:34', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('37', '', 'scheduler', 'Automated Notification Run', '{\"execution_time\":0.04,\"stats\":{\"due_reminders\":0,\"overdue_alerts\":0,\"reservation_notifications\":0,\"fine_reminders\":0,\"transaction_alerts\":0,\"errors\":0},\"timestamp\":\"2026-05-08 13:44:42\"}', 'sent', NULL, '2026-05-08 14:44:42', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('38', 'email', 'john.doe@example.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:22', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('39', 'sms', '+251911234567', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:22', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('40', 'email', 'jane.smith@example.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:23', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('41', 'sms', '+1-555-5678', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:23', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('42', 'email', 'bob.johnson@example.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:24', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('43', 'sms', '+1-555-9012', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:25', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('44', 'email', 'alice.brown@example.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:26', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('45', 'sms', '+1-555-3456', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:26', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('46', 'email', 'charlie.wilson@example.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:28', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('47', 'sms', '+1-555-7890', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:28', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('48', 'email', 'adminf@library.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:30', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('49', 'sms', '3453433354', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:30', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('50', 'email', 'tesfayeaberalingane@gmail.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:31', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('51', 'sms', '+251911234567', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:31', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('52', 'email', 'tesfa@gmail.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:32', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('53', 'sms', '+251911234567', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:32', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('54', 'email', 'tr@gmail.com', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'failed', 'SMTP Error: Could not authenticate.', '2026-05-08 15:23:33', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');
INSERT INTO `notification_logs` VALUES ('55', 'sms', '+251911234567', NULL, 'okkkkkkkkkkkkkkkkkkkk', 'sent', NULL, '2026-05-08 15:23:33', NULL, NULL, NULL, NULL, NULL, NULL, '0.0000');

-- Table: notification_settings
DROP TABLE IF EXISTS `notification_settings`;
Create Table;

-- Data for table notification_settings
INSERT INTO `notification_settings` VALUES ('1', '1', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('2', '2', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('3', '3', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('4', '4', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('5', '5', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('6', '6', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('7', '7', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('8', '8', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('9', '9', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('10', '10', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('11', '11', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('12', '12', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('13', '13', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');
INSERT INTO `notification_settings` VALUES ('14', '14', '1', '0', '1', '[3, 1]', '[1, 3, 7]', '1', '1', '1', '2026-05-07 06:30:16', '2026-05-07 06:30:16');

-- Table: notifications
DROP TABLE IF EXISTS `notifications`;
Create Table;

-- Data for table notifications
INSERT INTO `notifications` VALUES ('1', '4', 'due_reminder', 'Book Due Soon', 'Your borrowed book \"The Great Gatsby\" is due in 3 days', 'unread', '1', 'loan', '2026-05-05 01:13:38', NULL);
INSERT INTO `notifications` VALUES ('2', '7', 'reservation_available', 'Book Reserved', 'Your reservation for \"Pride and Prejudice\" is confirmed', 'unread', '1', 'reservation', '2026-05-05 01:13:38', NULL);
INSERT INTO `notifications` VALUES ('3', '5', 'overdue_alert', 'Overdue Book', 'The book \"To Kill a Mockingbird\" is overdue. Please return it to avoid fines', 'read', '3', 'loan', '2026-05-05 01:13:38', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('4', '4', 'general', 'New Books Available', '25 new books have been added to the Fiction category', 'unread', NULL, NULL, '2026-05-05 01:13:38', NULL);
INSERT INTO `notifications` VALUES ('5', '8', 'payment_success', 'Fine Paid', 'Your overdue fine of $5.00 has been successfully paid', 'unread', '2', 'fine', '2026-05-05 01:13:38', NULL);
INSERT INTO `notifications` VALUES ('6', '5', '', 'Book Issued', 'You have successfully borrowed \'The Great Gatsby\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:24:35', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('7', '5', '', 'Book Issued', 'You have successfully borrowed \'1984\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:24:49', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('8', '5', '', 'Book Issued', 'You have successfully borrowed \'Pride and Prejudice\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:27:04', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('9', '5', '', 'Book Issued', 'You have successfully borrowed \'To Kill a Mockingbird\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:27:08', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('10', '5', '', 'Book Issued', 'You have successfully borrowed \'The Catcher in the Rye\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:27:13', '2026-05-06 14:16:05');
INSERT INTO `notifications` VALUES ('11', '12', '', 'Book Issued', 'You have successfully borrowed \'The Great Gatsby\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:33:12', '2026-05-06 14:01:12');
INSERT INTO `notifications` VALUES ('12', '12', '', 'Book Issued', 'You have successfully borrowed \'1984\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:34:08', '2026-05-06 14:01:12');
INSERT INTO `notifications` VALUES ('13', '12', '', 'Book Issued', 'You have successfully borrowed \'To Kill a Mockingbird\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:37:23', '2026-05-06 14:01:12');
INSERT INTO `notifications` VALUES ('14', '12', '', 'Book Issued', 'You have successfully borrowed \'Pride and Prejudice\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:37:29', '2026-05-06 14:01:12');
INSERT INTO `notifications` VALUES ('15', '12', '', 'Book Issued', 'You have successfully borrowed \'The Catcher in the Rye\'. Due date: 2026-05-19', 'read', NULL, NULL, '2026-05-05 19:37:33', '2026-05-06 14:01:12');
INSERT INTO `notifications` VALUES ('16', '13', '', 'Book Issued', 'You have successfully borrowed \'To Kill a Mockingbird\'. Due date: 2026-05-19', 'unread', NULL, NULL, '2026-05-05 19:47:10', NULL);
INSERT INTO `notifications` VALUES ('17', '13', '', 'Book Issued', 'You have successfully borrowed \'The Great Gatsby\'. Due date: 2026-05-19', 'unread', NULL, NULL, '2026-05-05 19:47:30', NULL);
INSERT INTO `notifications` VALUES ('18', '13', '', 'Book Issued', 'You have successfully borrowed \'The Catcher in the Rye\'. Due date: 2026-05-20', 'unread', NULL, NULL, '2026-05-06 07:20:08', NULL);
INSERT INTO `notifications` VALUES ('19', '13', '', 'Book Issued', 'You have successfully borrowed \'Moby Dick\'. Due date: 2026-05-20', 'unread', NULL, NULL, '2026-05-06 07:20:17', NULL);
INSERT INTO `notifications` VALUES ('20', '13', '', 'Book Reserved', 'You have successfully reserved \'1984\'. Queue position: 2', 'unread', NULL, NULL, '2026-05-06 07:20:22', NULL);
INSERT INTO `notifications` VALUES ('21', '5', '', 'Book Returned', 'You have successfully returned \'The Great Gatsby\'', 'read', NULL, NULL, '2026-05-06 14:47:12', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('22', '8', '', 'Reserved Book Available', 'Your reserved book \'The Great Gatsby\' is now available for pickup', 'unread', NULL, NULL, '2026-05-06 14:47:12', NULL);
INSERT INTO `notifications` VALUES ('23', '5', '', 'Book Returned', 'You have successfully returned \'1984\'', 'read', NULL, NULL, '2026-05-06 14:48:56', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('24', '7', '', 'Reserved Book Available', 'Your reserved book \'1984\' is now available for pickup', 'unread', NULL, NULL, '2026-05-06 14:48:56', NULL);
INSERT INTO `notifications` VALUES ('25', '5', '', 'Book Returned', 'You have successfully returned \'Pride and Prejudice\'', 'read', NULL, NULL, '2026-05-06 14:50:49', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('26', '5', '', 'Book Returned', 'You have successfully returned \'The Catcher in the Rye\'', 'read', NULL, NULL, '2026-05-06 14:51:22', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('27', '5', 'general', 'Book Renewed', 'You have successfully renewed \'To Kill a Mockingbird\'. New due date: June 2, 2026', 'read', NULL, NULL, '2026-05-06 15:03:19', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('28', '5', '', 'Book Issued', 'You have successfully borrowed \'Pride and Prejudice\'. Due date: 2026-05-20', 'read', NULL, NULL, '2026-05-06 15:07:16', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('29', '5', 'general', 'Book Renewed', 'You have successfully renewed \'Pride and Prejudice\'. New due date: June 3, 2026', 'read', NULL, NULL, '2026-05-06 15:07:30', '2026-05-07 01:11:20');
INSERT INTO `notifications` VALUES ('30', '5', '', 'Book Issued', 'You have successfully borrowed \'Brave New World\'. Due date: 2026-05-21', 'read', NULL, NULL, '2026-05-07 01:11:40', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('31', '5', 'general', 'Book Renewed', 'You have successfully renewed \'Brave New World\'. New due date: June 4, 2026', 'read', NULL, NULL, '2026-05-07 01:12:06', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('32', '5', '', 'Book Issued', 'You have successfully borrowed \'1984\'. Due date: 2026-05-21', 'read', NULL, NULL, '2026-05-07 01:12:28', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('33', '5', '', 'Book Issued', 'You have successfully borrowed \'The Hobbit\'. Due date: 2026-05-21', 'read', NULL, NULL, '2026-05-07 01:22:28', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('34', '5', 'general', 'Book Returned', 'You have successfully returned \'1984\'', 'read', NULL, NULL, '2026-05-07 00:28:08', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('35', '13', 'reservation_available', 'Reserved Book Available', 'Your reserved book \'1984\' is now available for pickup', 'unread', NULL, NULL, '2026-05-07 00:28:09', NULL);
INSERT INTO `notifications` VALUES ('36', '6', 'fine_notice', 'Overdue Fine', 'You have a fine of $25.00 for late return of \'The Great Gatsby\'', 'unread', NULL, NULL, '2026-05-07 00:45:56', NULL);
INSERT INTO `notifications` VALUES ('37', '6', 'general', 'Book Returned', 'You have successfully returned \'The Great Gatsby\'', 'unread', NULL, NULL, '2026-05-07 00:45:56', NULL);
INSERT INTO `notifications` VALUES ('38', '12', 'general', 'Book Returned', 'You have successfully returned \'Pride and Prejudice\'', 'unread', NULL, NULL, '2026-05-07 00:48:11', NULL);
INSERT INTO `notifications` VALUES ('39', '5', '', 'Book Issued', 'You have successfully borrowed \'Pride and Prejudice\'. Due date: 2026-05-20', 'read', NULL, NULL, '2026-05-07 00:49:07', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('40', '2', 'general', 'Book Deleted', 'You have successfully deleted the book \'new \' by F. Scott Fitzgerald from the library.', 'read', NULL, NULL, '2026-05-07 01:42:58', '2026-05-07 01:44:44');
INSERT INTO `notifications` VALUES ('41', '2', 'general', 'Book Deleted', 'You have successfully deleted the book \'new\' by F. Scott Fitzgerald from the library.', 'unread', NULL, NULL, '2026-05-07 01:52:54', NULL);
INSERT INTO `notifications` VALUES ('42', '2', '', 'Book Issued', 'You have successfully borrowed \'The Great Gatsb\'. Due date: 2026-05-21', 'unread', NULL, NULL, '2026-05-07 04:14:54', NULL);
INSERT INTO `notifications` VALUES ('43', '2', '', 'Book Issued', 'You have successfully borrowed \'The Catcher in the Rye\'. Due date: 2026-05-17', 'unread', NULL, NULL, '2026-05-07 04:17:27', NULL);
INSERT INTO `notifications` VALUES ('44', '5', '', 'Book Reserved', 'You have successfully reserved \'The Catcher in the Rye\'. Queue position: 1', 'read', NULL, NULL, '2026-05-07 06:17:39', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('45', '12', 'general', 'Book Returned', 'You have successfully returned \'The Catcher in the Rye\'', 'unread', NULL, NULL, '2026-05-07 06:19:10', NULL);
INSERT INTO `notifications` VALUES ('46', '5', 'reservation_available', 'Reserved Book Available', 'Your reserved book \'The Catcher in the Rye\' is now available for pickup', 'read', NULL, NULL, '2026-05-07 06:19:10', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('47', '7', 'due_reminder', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'unread', '5', 'loan', '2026-05-07 06:51:26', NULL);
INSERT INTO `notifications` VALUES ('48', '7', 'due_reminder', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'unread', '5', 'loan', '2026-05-07 06:55:06', NULL);
INSERT INTO `notifications` VALUES ('49', '7', 'due_reminder', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'unread', '5', 'loan', '2026-05-07 06:57:27', NULL);
INSERT INTO `notifications` VALUES ('50', '7', 'due_reminder', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'unread', '5', 'loan', '2026-05-07 07:06:16', NULL);
INSERT INTO `notifications` VALUES ('51', '5', 'due_reminder', '???? Book Due Reminder - 14 days remaining', 'Hi John Doe, your book \'The Hobbit\' by J.R.R. Tolkien is due in 14 days on May 21, 2026. Please return it on time to avoid late fees.', 'read', '23', 'loan', '2026-05-07 07:06:47', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('52', '5', 'due_reminder', '???? Book Due Reminder - 13 days remaining', 'Hi John Doe, your book \'Pride and Prejudice\' by Jane Austen is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'read', '24', 'loan', '2026-05-07 07:06:48', '2026-05-08 15:32:34');
INSERT INTO `notifications` VALUES ('53', '7', 'due_reminder', '???? Book Due Reminder - 3 days remaining', 'Hi Bob Johnson, your book \'Pride and Prejudice\' by Jane Austen is due in 3 days on May 10, 2026. Please return it on time to avoid late fees.', 'unread', '5', 'loan', '2026-05-07 07:06:49', NULL);
INSERT INTO `notifications` VALUES ('54', '12', 'due_reminder', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'The Great Gatsb\' by F. Scott Fitzgerald is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'unread', '11', 'loan', '2026-05-07 07:06:51', NULL);
INSERT INTO `notifications` VALUES ('55', '12', 'due_reminder', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'1984\' by George Orwell is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'unread', '12', 'loan', '2026-05-07 07:06:53', NULL);
INSERT INTO `notifications` VALUES ('56', '12', 'due_reminder', '???? Book Due Reminder - 12 days remaining', 'Hi tesfa, your book \'To Kill a Mockingbird\' by Harper Lee is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'unread', '13', 'loan', '2026-05-07 07:06:55', NULL);
INSERT INTO `notifications` VALUES ('57', '13', 'due_reminder', '???? Book Due Reminder - 12 days remaining', 'Hi tr, your book \'To Kill a Mockingbird\' by Harper Lee is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'unread', '16', 'loan', '2026-05-07 07:06:57', NULL);
INSERT INTO `notifications` VALUES ('58', '13', 'due_reminder', '???? Book Due Reminder - 12 days remaining', 'Hi tr, your book \'The Great Gatsb\' by F. Scott Fitzgerald is due in 12 days on May 19, 2026. Please return it on time to avoid late fees.', 'unread', '17', 'loan', '2026-05-07 07:06:58', NULL);
INSERT INTO `notifications` VALUES ('59', '13', 'due_reminder', '???? Book Due Reminder - 13 days remaining', 'Hi tr, your book \'The Catcher in the Rye\' by J.D. Salinger is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'unread', '18', 'loan', '2026-05-07 07:06:59', NULL);
INSERT INTO `notifications` VALUES ('60', '13', 'due_reminder', '???? Book Due Reminder - 13 days remaining', 'Hi tr, your book \'Moby Dick\' by Herman Melville is due in 13 days on May 20, 2026. Please return it on time to avoid late fees.', 'unread', '19', 'loan', '2026-05-07 07:07:01', NULL);
INSERT INTO `notifications` VALUES ('61', '5', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'read', NULL, NULL, '2026-05-08 15:23:22', '2026-05-08 15:32:33');
INSERT INTO `notifications` VALUES ('62', '6', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:23', NULL);
INSERT INTO `notifications` VALUES ('63', '7', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:25', NULL);
INSERT INTO `notifications` VALUES ('64', '8', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:27', NULL);
INSERT INTO `notifications` VALUES ('65', '9', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:28', NULL);
INSERT INTO `notifications` VALUES ('66', '10', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:30', NULL);
INSERT INTO `notifications` VALUES ('67', '11', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:31', NULL);
INSERT INTO `notifications` VALUES ('68', '12', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:32', NULL);
INSERT INTO `notifications` VALUES ('69', '13', 'general', 'ok this is new', 'okkkkkkkkkkkkkkkkkkkk', 'unread', NULL, NULL, '2026-05-08 15:23:34', NULL);
INSERT INTO `notifications` VALUES ('70', '17', 'general', 'Account Suspended', 'Your account has been suspended. Please contact the library for more information.', 'unread', NULL, NULL, '2026-05-08 16:53:47', NULL);
INSERT INTO `notifications` VALUES ('71', '17', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 16:54:01', NULL);
INSERT INTO `notifications` VALUES ('73', '5', 'general', 'Account Suspended', 'Your account has been suspended. Please contact the library for more information.', 'read', NULL, NULL, '2026-05-08 16:55:00', '2026-05-11 13:33:29');
INSERT INTO `notifications` VALUES ('74', '5', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'read', NULL, NULL, '2026-05-08 16:55:04', '2026-05-11 13:33:29');
INSERT INTO `notifications` VALUES ('75', '17', 'general', 'Account Suspended', 'Your account has been suspended. Please contact the library for more information.', 'unread', NULL, NULL, '2026-05-08 17:02:15', NULL);
INSERT INTO `notifications` VALUES ('76', '17', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 17:02:18', NULL);
INSERT INTO `notifications` VALUES ('77', '17', 'general', 'Account Suspended', 'Your account has been suspended. Reason: yea', 'unread', NULL, NULL, '2026-05-08 17:18:08', NULL);
INSERT INTO `notifications` VALUES ('78', '17', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 17:18:17', NULL);
INSERT INTO `notifications` VALUES ('79', '2', 'general', 'Account Suspended', 'Your account has been suspended. Reason: ok', 'unread', NULL, NULL, '2026-05-08 18:00:38', NULL);
INSERT INTO `notifications` VALUES ('80', '2', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 18:00:43', NULL);
INSERT INTO `notifications` VALUES ('81', '2', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 18:11:54', NULL);
INSERT INTO `notifications` VALUES ('82', '2', 'general', 'Account Suspended', 'Your account has been suspended. Reason: ok', 'unread', NULL, NULL, '2026-05-08 18:12:13', NULL);
INSERT INTO `notifications` VALUES ('83', '2', 'general', 'Account Activated', 'Your account has been reactivated. You can now access all library services.', 'unread', NULL, NULL, '2026-05-08 18:12:21', NULL);
INSERT INTO `notifications` VALUES ('84', '8', 'general', 'Account Suspended', 'Your account has been suspended. Please contact the library for more information.', 'unread', NULL, NULL, '2026-05-08 18:31:51', NULL);
INSERT INTO `notifications` VALUES ('85', '5', '', 'Book Issued', 'You have successfully borrowed \'The Catcher in the Rye\'. Due date: 2026-06-08', 'read', NULL, NULL, '2026-05-11 13:30:07', '2026-05-11 13:33:25');
INSERT INTO `notifications` VALUES ('86', '24', '', 'Book Issued', 'You have successfully borrowed \'Sample Book Title\'. Due date: 2026-06-08', 'unread', NULL, NULL, '2026-05-11 13:37:31', NULL);
INSERT INTO `notifications` VALUES ('87', '25', '', 'Book Issued', 'You have successfully borrowed \'The Hobbit\'. Due date: 2026-06-12', 'unread', NULL, NULL, '2026-05-15 18:36:08', NULL);
INSERT INTO `notifications` VALUES ('88', '24', '', 'Book Issued', 'You have successfully borrowed \'Another Book\'. Due date: 2026-06-12', 'unread', NULL, NULL, '2026-05-15 18:55:43', NULL);
INSERT INTO `notifications` VALUES ('91', '27', 'general', 'Account Suspended', 'Your account has been suspended. Reason: whaath', 'unread', NULL, NULL, '2026-05-16 08:51:24', NULL);

-- Table: payment_transactions
DROP TABLE IF EXISTS `payment_transactions`;
Create Table;

-- Table: reading_goals
DROP TABLE IF EXISTS `reading_goals`;
Create Table;

-- Data for table reading_goals
INSERT INTO `reading_goals` VALUES ('1', '4', 'yearly', '50', '32', '2026-01-01', '2026-12-31', 'active', '2026-05-05 01:13:39', '2026-05-05 01:13:39');
INSERT INTO `reading_goals` VALUES ('2', '4', 'monthly', '5', '3', '2026-05-01', '2026-05-31', 'active', '2026-05-05 01:13:39', '2026-05-05 01:13:39');
INSERT INTO `reading_goals` VALUES ('3', '5', 'yearly', '24', '12', '2026-01-01', '2026-12-31', 'active', '2026-05-05 01:13:39', '2026-05-05 01:13:39');

-- Table: reading_history
DROP TABLE IF EXISTS `reading_history`;
Create Table;

-- Data for table reading_history
INSERT INTO `reading_history` VALUES ('1', '4', '5', '2026-03-10', '2026-03-18', '100', '0', '0', 'completed', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `reading_history` VALUES ('2', '4', '6', '2026-03-20', NULL, '65', '0', '0', 'reading', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `reading_history` VALUES ('3', '5', '7', '2026-02-28', '2026-03-15', '100', '0', '0', 'completed', '2026-05-05 01:13:38', '2026-05-05 01:13:38');
INSERT INTO `reading_history` VALUES ('4', '6', '8', '2026-04-01', NULL, '30', '0', '0', 'reading', '2026-05-05 01:13:38', '2026-05-05 01:13:38');

-- Table: system_logs
DROP TABLE IF EXISTS `system_logs`;
Create Table;

-- Data for table system_logs
INSERT INTO `system_logs` VALUES ('1', 'super_admin_created', 'Super Administrator account created with ID: 24', '2026-05-09 11:28:25', '2026-05-09 11:28:25');
INSERT INTO `system_logs` VALUES ('2', 'cache_clear', 'System cache cleared: 0 files', '2026-05-09 11:47:23', '2026-05-09 11:47:23');
INSERT INTO `system_logs` VALUES ('3', 'system_backup', 'Full system backup created: super_admin_backup_2026-05-09_10-47-29.sql', '2026-05-09 11:47:29', '2026-05-09 11:47:29');
INSERT INTO `system_logs` VALUES ('4', 'system_backup', 'Full system backup created: super_admin_backup_2026-05-11_14-01-31.sql', '2026-05-11 15:01:31', '2026-05-11 15:01:31');
INSERT INTO `system_logs` VALUES ('5', 'maintenance_mode', 'Maintenance mode enabled', '2026-05-11 15:03:28', '2026-05-11 15:03:28');

-- Table: system_settings
DROP TABLE IF EXISTS `system_settings`;
Create Table;

-- Data for table system_settings
INSERT INTO `system_settings` VALUES ('7', 'system', 'notification_email', 'library@example.com', 'Email address for system notifications', '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('8', 'system', 'chapa_public_key', 'CHAPA_PUBLIC_KEY_HERE', 'Chapa payment gateway public key', '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('9', 'system', 'chapa_secret_key', 'CHAPA_SECRET_KEY_HERE', 'Chapa payment gateway secret key', '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('10', 'system', 'google_books_api_key', 'GOOGLE_BOOKS_API_KEY_HERE', 'Google Books API key for metadata', '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('11', 'system', 'sendgrid_api_key', 'SENDGRID_API_KEY_HERE', 'SendGrid API key for email notifications', '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('12', 'library_policies', 'max_user_borrow_books', '9', 'Maximum books a user can borrow simultaneously', '2026-05-16 09:44:34', NULL);
INSERT INTO `system_settings` VALUES ('13', 'library_policies', 'due_fines_per_day', '0.6', 'Daily fine amount for overdue books (USD)', '2026-05-16 09:44:34', NULL);
INSERT INTO `system_settings` VALUES ('14', 'library_policies', 'max_book_return_days', '46', 'Maximum days allowed for book return', '2026-05-16 09:44:34', NULL);
INSERT INTO `system_settings` VALUES ('16', 'library', 'description', 'A comprehensive digital library management solution', NULL, '2026-05-16 09:43:57', NULL);
INSERT INTO `system_settings` VALUES ('17', 'library', 'address', '123 Library Street, Education Cityy', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('18', 'library', 'phone', '+1 (555) 123-45676', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('19', 'library', 'email', 'iinfo@digitallibrary.com', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('20', 'library', 'website', 'https://digitallibrary.com', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('24', 'library', 'operatingHours', '{\"monday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"tuesday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"wednesday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"thursday\":{\"open\":\"08:00\",\"close\":\"20:00\",\"closed\":false},\"friday\":{\"open\":\"08:00\",\"close\":\"18:00\",\"closed\":false},\"saturday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"sunday\":{\"open\":\"10:00\",\"close\":\"16:00\",\"closed\":false}}', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('25', 'library', 'socialMedia', '{\"facebook\":\"https:\\/\\/facebook.com\\/digitallibrary\",\"twitter\":\"https:\\/\\/twitter.com\\/digitallibrary\",\"instagram\":\"https:\\/\\/instagram.com\\/digitallibrary\",\"linkedin\":\"https:\\/\\/linkedin.com\\/company\\/digitallibrary\"}', NULL, '2026-05-16 09:43:58', NULL);
INSERT INTO `system_settings` VALUES ('93', 'library', 'libraryName', 'Digital Library Management Systeme', 'Library display name', '2026-05-16 09:43:57', NULL);
INSERT INTO `system_settings` VALUES ('144', 'system', 'maxReservationsPerUser', '4', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('145', 'system', 'reservationHoldDays', '8', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('146', 'system', 'renewalLimit', '2', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('147', 'system', 'gracePeriodDays', '3', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('148', 'system', 'autoRenewal', '1', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('149', 'system', 'emailNotifications', '1', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('150', 'system', 'smsNotifications', '1', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('151', 'system', 'overdueNotificationDays', '[1,3,7,1,3,7]', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('152', 'system', 'maintenanceMode', '1', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('153', 'system', 'allowRegistration', '1', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('154', 'system', 'requireEmailVerification', '1', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('155', 'system', 'sessionTimeout', '60', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('156', 'system', 'passwordMinLength', '8', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('157', 'system', 'passwordRequireSpecial', '', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('158', 'system', 'twoFactorAuth', '1', NULL, '2026-05-16 09:31:59', NULL);
INSERT INTO `system_settings` VALUES ('285', 'system', 'maintenance_mode', '1', NULL, '2026-05-16 09:32:00', NULL);
INSERT INTO `system_settings` VALUES ('341', 'library_policies', 'max_reservations_per_user', '4', 'Library policy', '2026-05-16 09:42:10', NULL);
INSERT INTO `system_settings` VALUES ('342', 'library_policies', 'grace_period_days', '3', 'Library policy', '2026-05-16 09:42:10', NULL);
INSERT INTO `system_settings` VALUES ('343', 'library_policies', 'renewal_limit', '2', 'Library policy', '2026-05-16 09:42:10', NULL);
INSERT INTO `system_settings` VALUES ('344', 'library_policies', 'reservation_hold_days', '8', 'Library policy', '2026-05-16 09:42:10', NULL);
INSERT INTO `system_settings` VALUES ('346', 'appearance', 'theme', 'dark', NULL, '2026-05-16 12:12:53', NULL);
INSERT INTO `system_settings` VALUES ('347', 'appearance', 'primaryColor', '#1f423c', NULL, '2026-05-16 12:12:54', NULL);
INSERT INTO `system_settings` VALUES ('348', 'appearance', 'secondaryColor', '#0c0d0c', NULL, '2026-05-16 12:12:54', NULL);
INSERT INTO `system_settings` VALUES ('349', 'appearance', 'logo', '', NULL, '2026-05-16 12:12:55', NULL);
INSERT INTO `system_settings` VALUES ('350', 'appearance', 'favicon', '', NULL, '2026-05-16 12:12:55', NULL);
INSERT INTO `system_settings` VALUES ('351', 'appearance', 'customCSS', '', NULL, '2026-05-16 12:12:55', NULL);
INSERT INTO `system_settings` VALUES ('352', 'appearance', 'showBranding', 'true', NULL, '2026-05-16 12:12:55', NULL);
INSERT INTO `system_settings` VALUES ('353', 'appearance', 'compactMode', 'false', NULL, '2026-05-16 12:12:56', NULL);
INSERT INTO `system_settings` VALUES ('354', 'appearance', 'animationsEnabled', 'true', NULL, '2026-05-16 12:12:56', NULL);

-- Table: user_achievements
DROP TABLE IF EXISTS `user_achievements`;
Create Table;

-- Data for table user_achievements
INSERT INTO `user_achievements` VALUES ('1', '4', '1', '2026-05-05 01:13:39');
INSERT INTO `user_achievements` VALUES ('2', '4', '4', '2026-05-05 01:13:39');
INSERT INTO `user_achievements` VALUES ('3', '5', '2', '2026-05-05 01:13:39');

-- Table: users
DROP TABLE IF EXISTS `users`;
Create Table;

-- Data for table users
INSERT INTO `users` VALUES ('1', 'ADMIN001', NULL, 'System Administrator', 'admin@digitallibrary.com', NULL, NULL, NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', NULL, NULL, 'uploads/profile_images/user_1_1778131433.PNG', '2026-05-05 01:13:37', '2026-05-12 12:14:23', '2026-05-12 12:14:23', NULL);
INSERT INTO `users` VALUES ('2', 'LIB001', 'LIB0002', 'Sarah Johnson', 'sarah@library.com', '+1-555-0101', '123 Library St, City, State', 'General', '2026-05-05', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, NULL, 'uploads/profile_images/user_2_1778122309.png', '2026-05-05 01:13:37', '2026-05-12 12:13:11', '2026-05-12 12:13:11', NULL);
INSERT INTO `users` VALUES ('3', 'LIB002', 'LIB0003', 'Michael Chen', 'michael@library.com', '+1-555-0102', '456 Book Ave, City, State', 'General', '2026-05-05', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, NULL, NULL, '2026-05-05 01:13:37', '2026-05-08 18:37:45', NULL, NULL);
INSERT INTO `users` VALUES ('4', 'LIB003', '', 'Emily Davis', 'emily@library.com', '+1-555-01033', '789 Reading Rd, City, State', '', '2026-05-08', 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'librarian', 'active', NULL, 'Demoted from librarian: okkkkkkkkkkkkkkkkk', NULL, '2026-05-05 01:13:37', '2026-05-15 19:17:09', NULL, NULL);
INSERT INTO `users` VALUES ('5', 'USR001', NULL, 'John Doe', 'john.doe@example.com', '+251911234567', '444444444444444444444', NULL, NULL, 'morning', '$2y$10$n4jDK3wkXkzZDneB13Wnw.MGEaq.NfynKwbnMDaaZvkxCbdw3afEq', 'user', 'active', NULL, NULL, 'uploads/profile_images/user_5_1778074616.PNG', '2026-05-05 01:13:37', '2026-05-11 13:03:59', '2026-05-11 13:03:59', NULL);
INSERT INTO `users` VALUES ('6', 'USR002', NULL, 'Jane Smith', 'jane.smith@example.com', '+1-555-5678', '456 Oak Ave, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37', NULL, NULL);
INSERT INTO `users` VALUES ('7', 'USR003', NULL, 'Bob Johnson', 'bob.johnson@example.com', '+1-555-9012', '789 Pine St, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37', NULL, NULL);
INSERT INTO `users` VALUES ('8', 'USR004', NULL, 'Alice Brown', 'alice.brown@example.com', '+1-555-3456', '321 Elm St, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'suspended', NULL, NULL, NULL, '2026-05-05 01:13:37', '2026-05-08 18:31:51', NULL, NULL);
INSERT INTO `users` VALUES ('9', 'USR005', NULL, 'Charlie Wilson', 'charlie.wilson@example.com', '+1-555-7890', '654 Maple Ave, City, State 12345', NULL, NULL, 'morning', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, '2026-05-05 01:13:37', '2026-05-05 01:13:37', NULL, NULL);
INSERT INTO `users` VALUES ('10', 'USR006', NULL, 'dffd', 'adminf@library.com', '3453433354', '123', NULL, NULL, 'morning', '$2y$10$Xgd0rtIgTmotk5Wi0RBbAOrkplX8G7ARH.NFw/rP.Jn7yLIX/j5Q2', 'user', 'active', NULL, NULL, NULL, '2026-05-05 18:14:02', '2026-05-05 18:14:02', NULL, NULL);
INSERT INTO `users` VALUES ('11', 'USR007', NULL, 'dffd', 'tesfayeaberalingane@gmail.com', '+251911234567', '123', NULL, NULL, 'morning', '$2y$10$IK.KPWFFlqz1CT36V4oSUejNSk5xtVV58l1GRzBHZpJJAlp4ZgRcO', 'user', 'active', NULL, NULL, NULL, '2026-05-05 18:29:32', '2026-05-05 18:29:56', '2026-05-05 18:29:56', NULL);
INSERT INTO `users` VALUES ('12', 'USR008', NULL, 'tesfa', 'tesfa@gmail.com', '+251911234567', '123333333333333', NULL, NULL, 'morning', '$2y$10$JT4t8Kuf8i8c5MLmvHA.8udvGQbP0/58H1HmYa7zRgTb6ZQIHiVbG', 'user', 'active', NULL, NULL, NULL, '2026-05-05 18:45:26', '2026-05-07 06:18:38', '2026-05-07 06:18:38', NULL);
INSERT INTO `users` VALUES ('13', 'USR009', 'LIB0013', 'tr', 'tr@gmail.com', '+251911234567', '123', 'General', '2026-05-05', 'morning', '$2y$10$vrcco/k6X6PwefJOFZUOQ.d5XiA7U25tGEmV3IkYZ3YODfg9wm9rW', 'librarian', 'active', 'okkkkkk', NULL, NULL, '2026-05-05 19:46:40', '2026-05-08 18:37:45', '2026-05-05 19:47:03', NULL);
INSERT INTO `users` VALUES ('14', 'USR010', NULL, 'tesfaye', 'admin@library.com', '+251911234567', '123', NULL, NULL, 'morning', '$2y$10$bWUn13SJ2mSWhE8wuHLXyekyVzRRUpvLNRv4.8ucxypPfXPlpZV2u', 'user', 'active', 'overdoue', NULL, NULL, '2026-05-07 01:45:44', '2026-05-08 16:49:28', '2026-05-07 07:09:01', NULL);
INSERT INTO `users` VALUES ('17', 'USER001', '', 'tesfaye abera (Updated)', 'asssok@co.com', '111111111111111111', '123errr', '', '2026-05-08', 'morning', '$2y$10$jHqAlH9lSEvUxQCeGm4UlelgkmbOOeveH8ZqLXojt/XF.KtcvFp2u', 'librarian', 'active', NULL, NULL, NULL, '2026-05-08 16:41:25', '2026-05-15 19:25:03', NULL, NULL);
INSERT INTO `users` VALUES ('23', 'USER002', NULL, 'tee', 'tee@gmail.com', '55555555555555', '123', NULL, NULL, 'morning', '$2y$10$TSY.DtOjVI8C8N9rOTwVhO/Ohg.uDE/EGTiiQZtDw325qraCeAHLG', 'user', 'active', NULL, NULL, NULL, '2026-05-09 09:22:03', '2026-05-09 09:22:03', NULL, NULL);
INSERT INTO `users` VALUES ('24', 'SUPER001', NULL, 'Super Administrator', 'superadmin@digitallibrary.com', '+251911234567', '', NULL, NULL, 'morning', '$2y$10$x3idYso5xJWtlenH8A/I2uvzY7bja3u59PsZ1TvcgLeQO4n8w95ly', 'super-admin', 'active', NULL, NULL, 'uploads/profile_images/user_24_1778574397.jpg', '2026-05-09 12:28:24', '2026-05-16 13:17:09', '2026-05-16 13:17:09', NULL);
INSERT INTO `users` VALUES ('25', 'USR011', NULL, 'tttttttt', 'sarahh@library.com', '+251911234567', '1234', NULL, NULL, 'morning', '$2y$10$/4oY84W4Wwp4o40ehNeYL.BDpzAYRGci6o5uC9Ujh/86T7/pt/jHi', 'user', 'active', NULL, NULL, NULL, '2026-05-15 18:29:54', '2026-05-15 18:35:48', '2026-05-15 18:35:48', NULL);
INSERT INTO `users` VALUES ('27', 'ADMIN002', NULL, 'tesfaye', 'tt@gmail.com', '1111111111111', '1234', NULL, NULL, 'morning', '$2y$10$vgYR4RRxU097.87hhOMntul.oQEGvUuK0yyVxMhRjF6tsutiUNmde', 'admin', 'inactive', NULL, NULL, NULL, '2026-05-16 08:51:01', '2026-05-16 08:51:44', NULL, NULL);

