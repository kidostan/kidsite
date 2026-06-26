<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();
$slug = $_GET['slug'] ?? '';

$category = $db->querySingle("SELECT * FROM Category WHERE slug = '$slug'", true);
if (!$category) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404</title></head><body><h1>Категория не найдена</h1><a href="/categories">Вернуться</a></body></html>';
    exit;
}

$stories = [];
$r = $db->query("SELECT s.id, s.title, s.slug, s.coverImageUrl, s.readingTimeMinutes, s.viewCount, s.metadata, c.name as category_name, c.slug as category_slug
    FROM StoryCategory sc JOIN Story s ON sc.storyId = s.id LEFT JOIN Category c ON s.categoryId = c.id
    WHERE sc.categoryId = '{$category['id']}' AND s.status = 'published' ORDER BY s.createdAt DESC");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $stories[] = $row;

header_html($category['name'], $category['description'] ?? '');
?>

<main class="flex-1 py-8">
    <div class="container mx-auto px-4">
        <?= render_breadcrumbs([['name' => 'Главная', 'url' => '/'], ['name' => 'Категории', 'url' => '/categories'], ['name' => $category['name']]]) ?>
        <h1 class="text-3xl font-bold mb-2"><?= e($category['name']) ?></h1>
        <?php if ($category['description']): ?>
        <p class="text-gray-600 mb-6"><?= e($category['description']) ?></p>
        <?php endif; ?>
        <?php if (empty($stories)): ?>
            <p class="text-gray-500">В этой категории пока нет сказок.</p>
        <?php else: ?>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                <?php foreach ($stories as $s): ?>
                <?= render_story_card($s) ?>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<?php footer_html(); ?>
