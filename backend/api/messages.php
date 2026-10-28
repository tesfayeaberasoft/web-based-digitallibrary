<?php
/**
 * Role-scoped direct messaging API.
 * GET /api/messages/contacts
 * GET /api/messages/threads
 * GET /api/messages/conversation?peer_id={user_id}
 * POST /api/messages { "receiver_id": 1, "message_content": "..." }
 * PUT /api/messages/{message_id}/read
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

function messageJsonResponse($status, array $body)
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function messagingPeerRoles($role)
{
    $relationships = [
        'user' => ['librarian'],
        'librarian' => ['user', 'admin'],
        'admin' => ['librarian', 'super-admin'],
        'super-admin' => ['admin'],
    ];

    return $relationships[$role] ?? [];
}

$identity = requireAuth();
$userId = filter_var($identity['user_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$action = $_GET['action'] ?? '';

if (!$userId) {
    messageJsonResponse(401, ['success' => false, 'message' => 'Invalid user session.']);
}

try {
    $db = Database::getInstance()->getConnection();
    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    $currentStmt = $db->prepare("SELECT id, full_name, role FROM users WHERE id = ? AND status = 'active' LIMIT 1");
    $currentStmt->execute([$userId]);
    $currentUser = $currentStmt->fetch(PDO::FETCH_ASSOC);
    if (!$currentUser) {
        messageJsonResponse(401, ['success' => false, 'message' => 'Your account is not active.']);
    }
    $currentRole = $currentUser['role'];
    $peerRoles = messagingPeerRoles($currentRole);

    if ($method === 'GET' && $action === 'contacts') {
        if (!$peerRoles) {
            messageJsonResponse(403, ['success' => false, 'message' => 'Messaging is not available for this role.']);
        }

        $rolePlaceholders = implode(',', array_fill(0, count($peerRoles), '?'));
        $params = array_merge($peerRoles, [$userId, $userId]);
        $conversationFilter = '';
        if ($currentRole === 'librarian') {
            $conversationFilter = " AND (u.role <> 'user' OR EXISTS (
                SELECT 1 FROM messages existing
                WHERE (existing.sender_id = ? AND existing.receiver_id = u.id)
                   OR (existing.sender_id = u.id AND existing.receiver_id = ?)
            ))";
        } else {
            array_pop($params);
            array_pop($params);
        }

        $stmt = $db->prepare("
            SELECT u.id, u.full_name, u.role
            FROM users u
            WHERE u.status = 'active' AND u.role IN ($rolePlaceholders)$conversationFilter
            ORDER BY u.full_name ASC
        ");
        $stmt->execute($params);
        messageJsonResponse(200, ['success' => true, 'contacts' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    if ($method === 'GET' && $action === 'threads') {
        $stmt = $db->prepare("
            SELECT peer.id AS user_id, peer.full_name, peer.role,
                   latest.id AS last_message_id, latest.message_content,
                   latest.sender_id, latest.created_at,
                   (SELECT COUNT(*) FROM messages unread
                    WHERE unread.sender_id = peer.id AND unread.receiver_id = ?
                      AND unread.status = 'unread') AS unread_count
            FROM (
                SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS peer_id,
                       MAX(id) AS last_message_id
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY peer_id
            ) thread
            JOIN messages latest ON latest.id = thread.last_message_id
            JOIN users peer ON peer.id = thread.peer_id
            WHERE peer.status = 'active' AND peer.role IN (" . implode(',', array_fill(0, count($peerRoles), '?')) . ")
            ORDER BY latest.id DESC
        ");
        $stmt->execute(array_merge([$userId, $userId, $userId, $userId], $peerRoles));
        messageJsonResponse(200, ['success' => true, 'threads' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    if ($method === 'GET' && $action === 'conversation') {
        $peerId = filter_var($_GET['peer_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$peerId || $peerId === (int)$userId) {
            messageJsonResponse(400, ['success' => false, 'message' => 'A valid conversation participant is required.']);
        }

        $peerStmt = $db->prepare("SELECT id, role FROM users WHERE id = ? AND status = 'active' LIMIT 1");
        $peerStmt->execute([$peerId]);
        $peer = $peerStmt->fetch(PDO::FETCH_ASSOC);
        if (!$peer || !in_array($peer['role'], $peerRoles, true)) {
            messageJsonResponse(403, ['success' => false, 'message' => 'You cannot access this conversation.']);
        }

        $stmt = $db->prepare("
            SELECT recent.id, recent.sender_id, recent.receiver_id,
                   recent.sender_role, recent.receiver_role, recent.message_content,
                   recent.status, recent.created_at
            FROM (
                SELECT id, sender_id, receiver_id, sender_role, receiver_role,
                       message_content, status, created_at
                FROM messages
                WHERE (sender_id = ? AND receiver_id = ?)
                   OR (sender_id = ? AND receiver_id = ?)
                ORDER BY id DESC
                LIMIT 100
            ) recent
            ORDER BY recent.id ASC
        ");
        $stmt->execute([$userId, $peerId, $peerId, $userId]);
        messageJsonResponse(200, ['success' => true, 'messages' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    if ($method === 'POST' && $action === '') {
        $rawBody = file_get_contents('php://input');
        if ($rawBody === false || strlen($rawBody) > 16384) {
            messageJsonResponse(413, ['success' => false, 'message' => 'Message payload is too large.']);
        }

        $payload = json_decode($rawBody, true);
        $receiverId = filter_var($payload['receiver_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $content = trim((string)($payload['message_content'] ?? ''));
        if (json_last_error() !== JSON_ERROR_NONE || !$receiverId || $receiverId === (int)$userId
            || $content === '' || strlen($content) > 16000) {
            messageJsonResponse(400, ['success' => false, 'message' => 'A recipient and a message of 1–4000 characters are required.']);
        }
        if (preg_match('//u', $content) !== 1) {
            messageJsonResponse(400, ['success' => false, 'message' => 'Message text must be valid UTF-8.']);
        }

        $receiverStmt = $db->prepare("SELECT id, role FROM users WHERE id = ? AND status = 'active' LIMIT 1");
        $receiverStmt->execute([$receiverId]);
        $receiver = $receiverStmt->fetch(PDO::FETCH_ASSOC);
        if (!$receiver || !in_array($receiver['role'], $peerRoles, true)) {
            messageJsonResponse(403, ['success' => false, 'message' => 'You cannot message this account.']);
        }

        $stmt = $db->prepare("
            INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, message_content, status)
            VALUES (?, ?, ?, ?, ?, 'unread')
        ");
        $stmt->execute([$userId, $receiverId, $currentRole, $receiver['role'], $content]);
        $messageId = (int)$db->lastInsertId();

        $stmt = $db->prepare("
            SELECT id, sender_id, receiver_id, sender_role, receiver_role,
                   message_content, status, created_at
            FROM messages WHERE id = ? LIMIT 1
        ");
        $stmt->execute([$messageId]);
        messageJsonResponse(201, ['success' => true, 'message' => $stmt->fetch(PDO::FETCH_ASSOC)]);
    }

    if ($method === 'PUT' && isset($_GET['message_id'])) {
        $messageId = filter_var($_GET['message_id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$messageId) {
            messageJsonResponse(400, ['success' => false, 'message' => 'A valid message ID is required.']);
        }

        $stmt = $db->prepare("UPDATE messages SET status = 'read' WHERE id = ? AND receiver_id = ?");
        $stmt->execute([$messageId, $userId]);
        if ($stmt->rowCount() === 0) {
            $exists = $db->prepare('SELECT id FROM messages WHERE id = ? AND receiver_id = ? LIMIT 1');
            $exists->execute([$messageId, $userId]);
            if (!$exists->fetchColumn()) {
                messageJsonResponse(404, ['success' => false, 'message' => 'Message not found.']);
            }
        }
        messageJsonResponse(200, ['success' => true, 'message_id' => (int)$messageId, 'status' => 'read']);
    }

    header('Allow: GET, POST, PUT');
    messageJsonResponse(405, ['success' => false, 'message' => 'Method or messaging action not allowed.']);
} catch (Exception $e) {
    error_log('Messaging API request failed: ' . $e->getMessage());
    messageJsonResponse(500, ['success' => false, 'message' => 'Messaging request failed.']);
}
