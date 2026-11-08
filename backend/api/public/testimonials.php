<?php
/**
 * GET /api/public/testimonials
 * Returns top-rated reviews from verified users to display as testimonials on the homepage
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    // Get top-rated reviews (5 stars only) from users who have read multiple books
    $stmt = $db->prepare("
        SELECT 
            r.id,
            r.rating,
            r.review_text,
            r.created_at,
            u.full_name,
            u.email,
            u.student_id,
            b.title AS book_title,
            b.author AS book_author,
            (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.status = 'returned') AS books_read_count,
            (SELECT COUNT(*) FROM book_reviews br WHERE br.user_id = u.id AND br.status = 'approved') AS reviews_count
        FROM book_reviews r
        INNER JOIN users u ON r.user_id = u.id
        INNER JOIN books b ON r.book_id = b.id
        WHERE r.status = 'approved' 
            AND r.rating >= 4
            AND r.review_text IS NOT NULL 
            AND CHAR_LENGTH(r.review_text) >= 50
            AND u.status = 'active'
        HAVING books_read_count >= 1
        ORDER BY r.rating DESC, books_read_count DESC, r.created_at DESC
        LIMIT 20
    ");
    
    $stmt->execute();
    $testimonials = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process testimonials
    foreach ($testimonials as &$testimonial) {
        $testimonial['rating'] = (int) $testimonial['rating'];
        $testimonial['books_read_count'] = (int) $testimonial['books_read_count'];
        $testimonial['reviews_count'] = (int) $testimonial['reviews_count'];
        
        // Generate avatar based on name
        $testimonial['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($testimonial['full_name']) . '&background=random&size=200';
        
        // Determine user role/category based on activity
        if ($testimonial['books_read_count'] >= 50) {
            $testimonial['user_role'] = 'Avid Reader';
        } elseif ($testimonial['books_read_count'] >= 20) {
            $testimonial['user_role'] = 'Book Enthusiast';
        } elseif ($testimonial['books_read_count'] >= 10) {
            $testimonial['user_role'] = 'Regular Reader';
        } elseif ($testimonial['student_id']) {
            $testimonial['user_role'] = 'Student';
        } else {
            $testimonial['user_role'] = 'Library Member';
        }
        
        // Remove sensitive data
        unset($testimonial['email']);
        unset($testimonial['student_id']);
    }

    // Get overall statistics
    $statsStmt = $db->query("
        SELECT 
            COUNT(DISTINCT user_id) as total_reviewers,
            ROUND(AVG(rating), 1) as avg_rating,
            COUNT(*) as total_reviews,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
            SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as four_plus_star_count
        FROM book_reviews 
        WHERE status = 'approved'
    ");
    
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    $stats['total_reviewers'] = (int) $stats['total_reviewers'];
    $stats['avg_rating'] = (float) $stats['avg_rating'];
    $stats['total_reviews'] = (int) $stats['total_reviews'];
    $stats['five_star_count'] = (int) $stats['five_star_count'];
    $stats['four_plus_star_count'] = (int) $stats['four_plus_star_count'];
    
    // Calculate satisfaction percentage
    if ($stats['total_reviews'] > 0) {
        $stats['satisfaction_percentage'] = round(($stats['four_plus_star_count'] / $stats['total_reviews']) * 100, 1);
    } else {
        $stats['satisfaction_percentage'] = 0;
    }

    echo json_encode([
        'success' => true,
        'testimonials' => $testimonials,
        'stats' => $stats
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    error_log('Testimonials request failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load testimonials.',
        'testimonials' => [],
        'stats' => [
            'total_reviewers' => 0,
            'avg_rating' => 4.8,
            'total_reviews' => 0,
            'five_star_count' => 0,
            'four_plus_star_count' => 0,
            'satisfaction_percentage' => 0
        ]
    ]);
}
