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
