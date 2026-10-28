ALTER TABLE users
MODIFY role ENUM('admin', 'librarian', 'user', 'super-admin') DEFAULT 'user';

UPDATE users
SET role = 'super-admin'
WHERE email = 'superadmin@digitallibrary.com' AND role = '';

INSERT INTO users (user_id, full_name, email, password_hash, role, status)
SELECT 'SUPER001', 'Super Administrator', 'superadmin@digitallibrary.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super-admin', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM users
    WHERE email = 'superadmin@digitallibrary.com' OR user_id = 'SUPER001'
);