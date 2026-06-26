<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();

$tags = [];
$r = $db->query("SELECT * FROM Tag ORDER BY name");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $tags[] = $row;

header_html('Теги');
?>

<main class="flex-1 py-8">
    <div class="container mx-auto px-4">
        <?= render_breadcrumbs([['name' => 'Главная', 'url' => '/'], ['name' => 'Теги']]) ?>
        <h1 class="text-3xl font-bold mb-6">Теги</h1>
        <div class="flex flex-wrap gap-2">
            <?php foreach ($tags as $t): ?>
            <a href="/tags/<?= e($t['slug']) ?>" class="bg-gray-100 hover:bg-purple-100 px-4 py-2 rounded-full text-sm transition-colors">
                <?= e($t['name']) ?>
                <span class="text-gray-400">(<?= $t['usageCount'] ?>)</span>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</main>

<?php footer_html(); ?>
