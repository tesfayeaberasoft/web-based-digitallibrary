<?php
require_once 'config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Additional sample data for enhanced analytics
    
    // Add more recent loans with varied times and dates for better analytics
    $loans = [
        [4, 5, '2026-04-15 09:30:00', '2026-05-15', '2026-04-28 14:20:00', 'returned', 2],
        [5, 6, '2026-04-18 14:15:00', '2026-05-18', NULL, 'active', 2],
        [6, 7, '2026-04-20 11:45:00', '2026-05-20', '2026-05-02 16:30:00', 'returned', 3],
        [7, 8, '2026-04-22 16:20:00', '2026-05-22', NULL, 'active', 2],
        [8, 1, '2026-04-25 10:10:00', '2026-05-25', NULL, 'active', 3],
        [4, 2, '2026-04-28 13:40:00', '2026-05-28', NULL, 'active', 2],
        [5, 3, '2026-05-01 08:50:00', '2026-05-31', NULL, 'active', 2],
        [6, 4, '2026-05-03 15:25:00', '2026-06-02', NULL, 'active', 3],
        [7, 5, '2026-05-05 12:15:00', '2026-06-04', NULL, 'active', 2],
        [8, 6, '2026-05-07 17:30:00', '2026-06-06', NULL, 'active', 2],
        
        // Peak hours data (different times of day)
        [4, 7, '2026-04-10 09:00:00', '2026-05-10', '2026-04-25 10:00:00', 'returned', 2],
        [5, 8, '2026-04-12 10:30:00', '2026-05-12', '2026-04-27 11:30:00', 'returned', 2],
        [6, 1, '2026-04-14 14:00:00', '2026-05-14', '2026-04-29 15:00:00', 'returned', 3],
        [7, 2, '2026-04-16 15:30:00', '2026-05-16', '2026-05-01 16:30:00', 'returned', 2],
        [8, 3, '2026-04-18 11:15:00', '2026-05-18', '2026-05-03 12:15:00', 'returned', 2],
        [4, 4, '2026-04-20 16:45:00', '2026-05-20', '2026-05-05 17:45:00', 'returned', 3],
        [5, 5, '2026-04-22 13:20:00', '2026-05-22', '2026-05-07 14:20:00', 'returned', 2],
        
        // Weekly pattern data (different days of week)
        [6, 6, '2026-04-21 10:00:00', '2026-05-21', '2026-05-06 11:00:00', 'returned', 2], // Monday
        [7, 7, '2026-04-22 14:30:00', '2026-05-22', '2026-05-07 15:30:00', 'returned', 3], // Tuesday  
        [8, 8, '2026-04-23 11:45:00', '2026-05-23', '2026-05-08 12:45:00', 'returned', 2], // Wednesday
        [4, 1, '2026-04-24 16:15:00', '2026-05-24', '2026-05-09 17:15:00', 'returned', 2], // Thursday
        [5, 2, '2026-04-25 09:30:00', '2026-05-25', '2026-05-10 10:30:00', 'returned', 3], // Friday
        [6, 3, '2026-04-26 13:00:00', '2026-05-26', '2026-05-11 14:00:00', 'returned', 2], // Saturday
        [7, 4, '2026-04-27 15:45:00', '2026-05-27', '2026-05-12 16:45:00', 'returned', 2]  // Sunday
    ];
    
    $stmt = $db->prepare("INSERT INTO book_loans (user_id, book_id, loan_date, due_date, return_date, status, issued_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($loans as $loan) {
        try {
            $stmt->execute($loan);
        } catch (Exception $e) {
            // Skip if already exists
            continue;
        }
    }
    
    // Add more fines for revenue analysis
    $fines = [
        [4, 1, 'overdue', 12.50, 12.50, 'Late return fine', 'paid', '2026-04-28 10:00:00'],
        [5, 2, 'overdue', 8.00, 8.00, 'Late return fine', 'paid', '2026-05-01 11:00:00'],
        [6, 3, 'damage', 25.00, 25.00, 'Book cover damage', 'paid', '2026-05-03 15:00:00'],
        [7, 4, 'overdue', 15.50, 0.00, 'Late return fine', 'pending', '2026-05-05 12:00:00'],
        [8, 5, 'lost', 45.00, 0.00, 'Lost book replacement', 'pending', '2026-05-07 14:00:00']
    ];
    
    $stmt = $db->prepare("INSERT INTO fines (user_id, loan_id, fine_type, amount, paid_amount, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($fines as $fine) {
        try {
            $stmt->execute($fine);
        } catch (Exception $e) {
            // Skip if already exists
            continue;
        }
    }
    
    echo "Sample data added successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>