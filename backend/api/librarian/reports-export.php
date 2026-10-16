<?php
/**
 * Librarian Reports Export API
 * GET /api/librarian/reports-export
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

try {
    // Require librarian or admin role
    $currentUser = requireRole(['librarian', 'admin']);
    
    $db = Database::getInstance()->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Get query parameters
    $type = isset($_GET['type']) ? $_GET['type'] : 'circulation';
    $format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-30 days'));
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d');
    
    // Get report data
    $data = null;
    switch ($type) {
        case 'circulation':
            $data = getCirculationReport($db, $start_date, $end_date);
            break;
        case 'inventory':
            $data = getInventoryReport($db, $start_date, $end_date);
            break;
        case 'members':
            $data = getMembersReport($db, $start_date, $end_date);
            break;
        case 'financial':
            $data = getFinancialReport($db, $start_date, $end_date);
            break;
        default:
            throw new Exception('Invalid report type');
    }
    
    // Export based on format
    switch ($format) {
        case 'csv':
            exportToCSV($type, $data, $start_date, $end_date);
            break;
        case 'json':
            exportToJSON($type, $data);
            break;
        case 'excel':
            exportToExcel($type, $data, $start_date, $end_date);
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

function getCirculationReport($db, $start_date, $end_date) {
    // Summary statistics
    $summary_query = "
        SELECT 
            COUNT(DISTINCT bl.id) as total_transactions,
            COUNT(DISTINCT bl.user_id) as active_members,
            COUNT(DISTINCT bl.book_id) as books_circulated,
            COALESCE(SUM(f.paid_amount), 0) as total_revenue
        FROM book_loans bl
        LEFT JOIN fines f ON f.user_id = bl.user_id
        WHERE bl.loan_date BETWEEN :start_date AND :end_date
    ";
    
    $stmt = $db->prepare($summary_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Daily statistics
    $daily_query = "
        SELECT 
            DATE(loan_date) as date,
            COUNT(CASE WHEN status = 'active' OR status = 'returned' THEN 1 END) as loans,
            COUNT(CASE WHEN status = 'returned' THEN 1 END) as returns,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
        FROM book_loans
        WHERE loan_date BETWEEN :start_date AND :end_date
        GROUP BY DATE(loan_date)
        ORDER BY date DESC
    ";
    
    $stmt = $db->prepare($daily_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $daily_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'summary' => $summary,
        'daily_stats' => $daily_stats
    ];
}

function getInventoryReport($db, $start_date, $end_date) {
    // By category
    $category_query = "
        SELECT 
            COALESCE(c.name, 'Uncategorized') as category,
            COUNT(b.id) as total,
            SUM(CASE WHEN b.status = 'active' THEN b.available_copies ELSE 0 END) as available,
            COUNT(CASE WHEN bl.status = 'active' THEN bl.id END) as borrowed,
            0 as reserved,
            ROUND(
                (COUNT(CASE WHEN bl.status = 'active' THEN bl.id END) * 100.0) / 
                NULLIF(COUNT(b.id), 0), 
                2
            ) as utilization
        FROM books b
        LEFT JOIN categories c ON c.id = b.category_id
        LEFT JOIN book_loans bl ON bl.book_id = b.id AND bl.status = 'active'
        GROUP BY c.name
        ORDER BY total DESC
    ";
    
    $stmt = $db->prepare($category_query);
    $stmt->execute();
    $by_category = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'by_category' => $by_category
    ];
}

function getMembersReport($db, $start_date, $end_date) {
    // By status
    $status_query = "
        SELECT 
            status,
            COUNT(*) as count,
            ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM users WHERE role = 'user'), 2) as percentage
        FROM users
        WHERE role = 'user'
        GROUP BY status
    ";
    
    $stmt = $db->prepare($status_query);
    $stmt->execute();
    $by_status = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Top active members
    $top_members_query = "
        SELECT 
            u.full_name as name,
            COUNT(bl.id) as books_borrowed
        FROM users u
        INNER JOIN book_loans bl ON bl.user_id = u.id
        WHERE u.role = 'user' AND bl.loan_date BETWEEN :start_date AND :end_date
        GROUP BY u.id, u.full_name
        ORDER BY books_borrowed DESC
        LIMIT 10
    ";
    
    $stmt = $db->prepare($top_members_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $top_members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'by_status' => $by_status,
        'top_members' => $top_members
    ];
}

function getFinancialReport($db, $start_date, $end_date) {
    // Fines summary
    $fines_query = "
        SELECT 
            COALESCE(SUM(amount), 0) as total,
            COUNT(*) as count,
            COALESCE(SUM(paid_amount), 0) as paid,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
            COALESCE(SUM(amount - paid_amount), 0) as unpaid,
            COUNT(CASE WHEN status != 'paid' THEN 1 END) as unpaid_count
        FROM fines
        WHERE created_at BETWEEN :start_date AND :end_date
    ";
    
    $stmt = $db->prepare($fines_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $fines_summary = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Fine details
    $details_query = "
        SELECT 
            u.full_name as member_name,
            b.title as book_title,
            f.amount,
            f.status,
            f.created_at as date
        FROM fines f
        INNER JOIN users u ON u.id = f.user_id
        INNER JOIN book_loans bl ON bl.id = f.loan_id
        INNER JOIN books b ON b.id = bl.book_id
        WHERE f.created_at BETWEEN :start_date AND :end_date
        ORDER BY f.created_at DESC
        LIMIT 500
    ";
    
    $stmt = $db->prepare($details_query);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $details = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $fines_summary['details'] = $details;
    
    return [
        'fines' => $fines_summary
    ];
}

function exportToCSV($type, $data, $start_date, $end_date) {
    $filename = "{$type}_report_{$start_date}_to_{$end_date}.csv";
    
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $output = fopen('php://output', 'w');
    
    // Add header
    fputcsv($output, ["Report Type: " . ucfirst($type)]);
    fputcsv($output, ["Period: $start_date to $end_date"]);
    fputcsv($output, ["Generated: " . date('Y-m-d H:i:s')]);
    fputcsv($output, []);
    
    switch ($type) {
        case 'circulation':
            if (isset($data['daily_stats'])) {
                fputcsv($output, ['Date', 'Loans', 'Returns', 'Active', 'Overdue']);
                foreach ($data['daily_stats'] as $stat) {
                    fputcsv($output, [
                        $stat['date'],
                        $stat['loans'],
                        $stat['returns'],
                        $stat['active'],
                        $stat['overdue']
                    ]);
                }
            }
            break;
            
        case 'inventory':
            if (isset($data['by_category'])) {
                fputcsv($output, ['Category', 'Total', 'Available', 'Borrowed', 'Utilization %']);
                foreach ($data['by_category'] as $cat) {
                    fputcsv($output, [
                        $cat['category'],
                        $cat['total'],
                        $cat['available'],
                        $cat['borrowed'],
                        $cat['utilization']
                    ]);
                }
            }
            break;
            
        case 'members':
            if (isset($data['by_status'])) {
                fputcsv($output, ['Status', 'Count', 'Percentage']);
                foreach ($data['by_status'] as $stat) {
                    fputcsv($output, [
                        $stat['status'],
                        $stat['count'],
                        $stat['percentage'] . '%'
                    ]);
                }
            }
            fputcsv($output, []);
            if (isset($data['top_members'])) {
                fputcsv($output, ['Top Active Members']);
                fputcsv($output, ['Name', 'Books Borrowed']);
                foreach ($data['top_members'] as $member) {
                    fputcsv($output, [
                        $member['name'],
                        $member['books_borrowed']
                    ]);
                }
            }
            break;
            
        case 'financial':
            if (isset($data['fines'])) {
                $fines = $data['fines'];
                fputcsv($output, ['Summary']);
                fputcsv($output, ['Total Fines', 'ETB ' . $fines['total']]);
                fputcsv($output, ['Paid', 'ETB ' . $fines['paid']]);
                fputcsv($output, ['Unpaid', 'ETB ' . $fines['unpaid']]);
                fputcsv($output, []);
                
                if (isset($fines['details'])) {
                    fputcsv($output, ['Member', 'Book', 'Amount', 'Status', 'Date']);
                    foreach ($fines['details'] as $fine) {
                        fputcsv($output, [
                            $fine['member_name'],
                            $fine['book_title'],
                            'ETB ' . $fine['amount'],
                            $fine['status'],
                            $fine['date']
                        ]);
                    }
                }
            }
            break;
    }
    
    fclose($output);
    exit;
}

function exportToJSON($type, $data) {
    $filename = "{$type}_report_" . date('Y-m-d') . ".json";
    
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

function exportToExcel($type, $data, $start_date, $end_date) {
    // For now, use CSV format as Excel-compatible
    // In production, you would use PHPSpreadsheet library
    exportToCSV($type, $data, $start_date, $end_date);
}
?>
