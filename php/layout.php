<?php
require_once __DIR__ . '/db.php';

function header_html(string $title = '', string $description = ''): void {
    $t = $title ? e($title) . ' — ' . e(SITE_NAME) : e(SITE_NAME) . ' — Сказки для детей онлайн';
    $d = $description ?: 'Читайте бесплатно сказки для детей онлайн. Народные, авторские, по возрасту.';
?>
<!DOCTYPE html>
<html lang="ru" class="h-full antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $t ?></title>
    <meta name="description" content="<?= $d ?>">
    <meta name="keywords" content="сказки для детей, сказки читать онлайн, народные сказки, сказки пушкина">
    <meta property="og:title" content="<?= $t ?>">
    <meta property="og:description" content="<?= $d ?>">
    <meta property="og:type" content="website">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 min-h-full flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-xl font-bold text-purple-600">📖 <?= e(SITE_NAME) ?></a>
            <nav class="hidden md:flex items-center gap-6">
                <a href="/stories" class="text-gray-600 hover:text-purple-600 transition-colors">Сказки</a>
                <a href="/categories" class="text-gray-600 hover:text-purple-600 transition-colors">Категории</a>
                <a href="/tags" class="text-gray-600 hover:text-purple-600 transition-colors">Теги</a>
            </nav>
            <form action="/stories" method="GET" class="hidden md:block">
                <input type="text" name="q" placeholder="Поиск сказок..."
                    class="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-purple-500 w-48">
            </form>
        </div>
    </header>
<?php
}

function footer_html(): void {
?>
    <footer class="bg-gray-50 border-t mt-16 py-8">
        <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; <?= date('Y') ?> <?= e(SITE_NAME) ?> — Сказки для детей онлайн</p>
            <p class="mt-1">Читайте бесплатно сказки для детей любого возраста</p>
        </div>
    </footer>
</body>
</html>
<?php
}
