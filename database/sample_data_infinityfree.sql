-- Safe starter catalog for InfinityFree.
-- In phpMyAdmin, select your prefixed database before importing this file.
-- This intentionally does not create users or insert demo passwords/secrets.
-- INSERT IGNORE makes this import safe to repeat for unique category names/ISBNs.

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

INSERT IGNORE INTO books (
    isbn, title, author, publisher, publication_year, category_id,
    description, total_copies, available_copies, pages, language, price
) VALUES
(
    '978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald',
    'Scribner', 1925, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'A classic American novel set in the Jazz Age', 5, 5, 180, 'English', 15.99
),
(
    '978-0-452-28423-4', '1984', 'George Orwell',
    'Penguin Books', 1949, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'A dystopian social science fiction novel', 8, 8, 328, 'English', 13.99
),
(
    '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee',
    'Harper Perennial', 1960, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'A novel about racial injustice and childhood in the American South', 6, 6, 376, 'English', 14.99
),
(
    '978-0-14-243724-7', 'Pride and Prejudice', 'Jane Austen',
    'Penguin Classics', 1813, (SELECT id FROM categories WHERE name = 'Romance' LIMIT 1),
    'A romantic novel of manners', 4, 4, 432, 'English', 12.99
),
(
    '978-0-7432-4722-4', 'The Catcher in the Rye', 'J.D. Salinger',
    'Little, Brown', 1951, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'A novel about teenage rebellion and identity', 3, 3, 277, 'English', 16.99
),
(
    '978-0-06-085052-4', 'Brave New World', 'Aldous Huxley',
    'Harper Perennial', 1932, (SELECT id FROM categories WHERE name = 'Science' LIMIT 1),
    'A dystopian novel about a technologically advanced future society', 5, 5, 311, 'English', 15.49
),
(
    '978-0-7432-7357-2', 'Moby Dick', 'Herman Melville',
    'Scribner', 1851, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'The epic tale of Captain Ahab and the white whale', 3, 3, 635, 'English', 18.99
),
(
    '978-0-06-112009-1', 'The Hobbit', 'J.R.R. Tolkien',
    'Houghton Mifflin', 1937, (SELECT id FROM categories WHERE name = 'Fiction' LIMIT 1),
    'A fantasy adventure novel', 7, 7, 310, 'English', 14.99
);
