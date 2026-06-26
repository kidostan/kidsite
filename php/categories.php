<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();

$categories = [];
$r = $db->query("SELECT c.*, (SELECT COUNT(*) FROM StoryCategory sc WHERE sc.categoryId = c.id) as story_count FROM Category c ORDER BY c.name");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $categories[] = $row;

header_html('Категории');
?>

<main class="flex-1 py-8">
    <div class="container mx-auto px-4">
        <?= render_breadcrumbs([['name' => 'Главная', 'url' => '/'], ['name' => 'Категории']]) ?>
        <h1 class="text-3xl font-bold mb-6">Категории</h1>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <?php foreach ($categories as $cat): ?>
            <a href="/categories/<?= e($cat['slug']) ?>" class="block p-6 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors border border-gray-100">
                <h3 class="font-bold text-gray-900"><?= e($cat['name']) ?></h3>
                <?php if ($cat['description']): ?>
                <p class="text-sm text-gray-500 mt-1"><?= e($cat['description']) ?></p>
                <?php endif; ?>
                <p class="text-sm text-purple-600 mt-2"><?= $cat['story_count'] ?> сказок</p>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</main>

<?php footer_html(); ?>
