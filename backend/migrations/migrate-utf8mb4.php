<?php

/**
 * Set the database defaults and convert existing tables to utf8mb4.
 * Run through backend/setup-database.php after backing up an existing database.
 */
function migrateDatabaseToUtf8mb4(PDO $db)
{
    $schema = $db->query('SELECT DATABASE()')->fetchColumn();
    if (!$schema) {
        throw new RuntimeException('Cannot determine the active database for the UTF-8 migration.');
    }

    $quotedSchema = '`' . str_replace('`', '``', $schema) . '`';
    $db->exec("ALTER DATABASE $quotedSchema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $stmt = $db->prepare("
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
          AND TABLE_TYPE = 'BASE TABLE'
          AND TABLE_COLLATION <> 'utf8mb4_unicode_ci'
    ");
    $stmt->execute([$schema]);

    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $tableName) {
        $quotedTable = '`' . str_replace('`', '``', $tableName) . '`';
        $db->exec("ALTER TABLE $quotedSchema.$quotedTable CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }
}
