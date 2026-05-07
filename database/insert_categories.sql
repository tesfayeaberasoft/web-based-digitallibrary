-- Insert Categories Only
-- Run this if categories are missing from your database

USE digital_library;

-- Clear existing categories (optional - comment out if you want to keep existing ones)
-- DELETE FROM categories;

-- Insert default categories
INSERT INTO categories (name, description, color_code) VALUES
('Fiction', 'Fictional literature including novels and short stories', '#9b59b6'),
('Science', 'Scientific books and research materials', '#3498db'),
('Academic', 'Academic textbooks and educational materials', '#e74c3c'),
('History', 'Historical books and documentaries', '#f39c12'),
('Technology', 'Technology, programming, and computer science books', '#2ecc71'),
('Arts', 'Art, music, and creative literature', '#e91e63'),
('Romance', 'Romance novels and love stories', '#ff6b9d'),
('Biography', 'Biographical and autobiographical works', '#3498db'),
('Children', 'Children and young adult books', '#1abc9c'),
('Business', 'Business and economics books', '#34495e');

-- Verify categories were inserted
SELECT id, name, color_code FROM categories;
