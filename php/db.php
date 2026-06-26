<?php
require_once __DIR__ . '/config.php';

function db(): SQLite3 {
    static $db = null;
    if ($db === null) {
        $db = new SQLite3(DB_PATH);
        $db->enableExceptions(true);
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA foreign_keys=ON');
    }
    return $db;
}

function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function slug(string $s): string {
    return strtolower(trim(preg_replace('/[^a-z0-9а-яё-]/iu', '-', $s), '-'));
}

function timeAgo(string $datetime): string {
    $now = new DateTime();
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);
    if ($diff->y > 0) return $diff->y . ' ' . ngettext('год', 'года', 'лет') . ' назад';
    if ($diff->m > 0) return $diff->m . ' мес. назад';
    if ($diff->d > 0) return $diff->d . ' дн. назад';
    if ($diff->h > 0) return $diff->h . ' ч. назад';
    if ($diff->i > 0) return $diff->i . ' мин. назад';
    return 'только что';
}
