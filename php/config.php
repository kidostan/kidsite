<?php
// Database configuration for SQLite
define('DB_PATH', __DIR__ . '/data/skazki.db');
define('APP_URL', 'https://skazkinason.ru');
define('SITE_NAME', 'Сказки на сон');

// Ensure data directory exists
if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}
