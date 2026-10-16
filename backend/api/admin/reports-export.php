<?php
/**
 * Admin Reports Export API
 * GET /api/admin/reports-export
 * Enhanced export for admin with full system data
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

try {
    // Require admin or super-admin role
    $currentUser = requireRole(['admin', 'super-admin']);
    
    $db = Database::getInstance()->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Get query parameters
    $type = isset($_GET['type']) ? $_GET['type'] : 'comprehensive';
    $format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
    
    // Get comprehensive report data
    $data = getComprehensiveReport($db, $start_date, $end_date);
    
    // Export based on format
    switch ($format) {
        case 'csv':
            exportToCSV($data, $start_date, $end_date);
            break;
        case 'json':
            exportToJSON($data);
            break;
        default:
            throw new Exception('Invalid export format');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to export report',
        'error' => $e->getMessage()
    ]);
}

function getComprehensiveReport($db, $start_date, $end_date) {
    $data = [];
    
    // System Overview
    $overview_query = "
        SELECT 
            (SELECT COUNT(*) FROM books) as total_books,
            (SELECT COUNT(*) FROM books WHERE status = 'active') as active_books,
            (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active') as active_users,
            (SELECT COUNT(*) FROM book_loans) as total_loans,
            (SELECT COUNT(*) FROM book_loans WHERE status = 'active') as active_loans,
            (SELECT COUNT(*) FROM book_loans WHERE status = 'overdue') as overdue_loans,
            (SELECT COALESCE(SUM(amount), 0) FROM fines) as total_fines,
            (SELECT COALESCE(SUM(paid_amount), 0) FROM fines) as paid_fines
    ";
    
    $stmt = $db->query($overview_query);
    $data['overview'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Recent Loans
    $loans_query = "
        SELECT 
            bl.id,
            u.full_name as member,
            u.email as member_email,
            b.title as book,
            b.isbn,
            bl.loan_date,
            bl.due_date,
            bl.return_date,
            bl.status
        FROM book_loans bl
        INNER JOIN users u ON u.id = bl.user_id
        INNER JOIN books b ON b.id = bl.book_id
        WHERE bl.loan_date BETWEEN :start_date AND :end_date
        ORDER BY bl.loan_date DESC
        LIMIT 1000
    ";
    
    $stmt = $db->prepare($loans_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $data['loans'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // All Books
    $books_query = "
        SELECT 
            b.id,
            b.title,
            b.author,
            b.isbn,
            b.publisher,
            b.publication_year,
            c.name as category,
            b.total_copies,
            b.available_copies,
            b.status,
            b.created_at
        FROM books b
        LEFT JOIN categories c ON c.id = b.category_id
        ORDER BY b.id DESC
    ";
    
    $stmt = $db->query($books_query);
    $data['books'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // All Users
    $users_query = "
        SELECT 
            id,
            full_name,
            email,
            phone,
            role,
            status,
            created_at,
            last_login
        FROM users
        ORDER BY created_at DESC
    ";
    
    $stmt = $db->query($users_query);
    $data['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fines
    $fines_query = "
        SELECT 
            f.id,
            u.full_name as member,
            u.email as member_email,
            b.title as book,
            f.amount,
            f.paid_amount,
            f.balance,
            f.status,
            f.created_at,
            f.paid_at
        FROM fines f
        INNER JOIN users u ON u.id = f.user_id
        INNER JOIN book_loans bl ON bl.id = f.loan_id
        INNER JOIN books b ON b.id = bl.book_id
        WHERE f.created_at BETWEEN :start_date AND :end_date
        ORDER BY f.created_at DESC
    ";
    
    $stmt = $db->prepare($fines_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $data['fines'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return $data;
}

function exportToCSV($data, $start_date, $end_date) {
    $filename = "admin_comprehensive_report_{$start_date}_to_{$end_date}.csv";
    
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $output = fopen('php://output', 'w');
    
    // Header
    fputcsv($output, ['Digital Library Management System - Comprehensive Report']);
    fputcsv($output, ['Report Period:', $start_date, 'to', $end_date]);
    fputcsv($output, ['Generated:', date('Y-m-d H:i:s')]);
    fputcsv($output, []);
    
    // System Overview
    if (isset($data['overview'])) {
        fputcsv($output, ['=== SYSTEM OVERVIEW ===']);
        $overview = $data['overview'];
        fputcsv($output, ['Total Books', $overview['total_books']]);
        fputcsv($output, ['Active Books', $overview['active_books']]);
        fputcsv($output, ['Total Users', $overview['total_users']]);
        fputcsv($output, ['Active Users', $overview['active_users']]);
        fputcsv($output, ['Total Loans', $overview['total_loans']]);
        fputcsv($output, ['Active Loans', $overview['active_loans']]);
        fputcsv($output, ['Overdue Loans', $overview['overdue_loans']]);
        fputcsv($output, ['Total Fines', 'ETB ' . $overview['total_fines']]);
        fputcsv($output, ['Paid Fines', 'ETB ' . $overview['paid_fines']]);
        fputcsv($output, []);
    }
    
    // Books
    if (isset($data['books']) && !empty($data['books'])) {
        fputcsv($output, ['=== BOOKS ===']);
        fputcsv($output, array_keys($data['books'][0]));
        foreach ($data['books'] as $row) {
            fputcsv($output, $row);
        }
        fputcsv($output, []);
    }
    
    // Users
    if (isset($data['users']) && !empty($data['users'])) {
        fputcsv($output, ['=== USERS ===']);
        fputcsv($output, array_keys($data['users'][0]));
        foreach ($data['users'] as $row) {
            fputcsv($output, $row);
        }
        fputcsv($output, []);
    }
    
    // Loans
    if (isset($data['loans']) && !empty($data['loans'])) {
        fputcsv($output, ['=== BOOK LOANS ===']);
        fputcsv($output, array_keys($data['loans'][0]));
        foreach ($data['loans'] as $row) {
            fputcsv($output, $row);
        }
        fputcsv($output, []);
    }
    
    // Fines
    if (isset($data['fines']) && !empty($data['fines'])) {
        fputcsv($output, ['=== FINES ===']);
        fputcsv($output, array_keys($data['fines'][0]));
        foreach ($data['fines'] as $row) {
            fputcsv($output, $row);
        }
        fputcsv($output, []);
    }
    
    fclose($output);
    exit;
}

function exportToJSON($data) {
    $filename = "admin_comprehensive_report_" . date('Y-m-d') . ".json";
    
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}
?>
