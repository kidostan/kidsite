<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$message = '';
$error = '';

if (file_exists(DB_PATH)) {
    $message = 'База данных уже существует. <a href="/">Перейти на главную</a>';
} elseif (isset($_POST['install'])) {
    try {
        $dumpFile = __DIR__ . '/dump.sql';
        if (!file_exists($dumpFile)) {
            throw new Exception('Файл dump.sql не найден');
        }

        $sql = file_get_contents($dumpFile);
        $db = db();
        $db->exec($sql);

        $message = 'Установка завершена! <a href="/">Перейти на главную</a>';
    } catch (Exception $e) {
        $error = 'Ошибка: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Установка — <?= SITE_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 class="text-2xl font-bold mb-4">📖 <?= SITE_NAME ?></h1>

        <?php if ($message): ?>
            <div class="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
                <?= $message ?>
            </div>
        <?php elseif ($error): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                <?= $error ?>
            </div>
        <?php else: ?>
            <p class="text-gray-600 mb-6">
                Нажмите кнопку ниже для установки базы данных с 97 сказками.
            </p>
            <form method="POST">
                <button type="submit" name="install" value="1"
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
                    Установить
                </button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
