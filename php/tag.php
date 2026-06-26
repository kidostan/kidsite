<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();
$slug = $_GET['slug'] ?? '';

$tag = $db->querySingle("SELECT * FROM Tag WHERE slug = '$slug'", true);
if (!$tag) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404</title></head><body><h1>Тег не найден</h1><a href="/tags">Вернуться</a></body></html>';
    exit;
}

$stories = [];
$r = $db->query("SELECT s.id, s.title, s.slug, s.coverImageUrl, s.readingTimeMinutes, s.viewCount, s.metadata, c.name as category_name, c.slug as category_slug
    FROM StoryTag st JOIN Story s ON st.storyId = s.id LEFT JOIN Category c ON s.categoryId = c.id
    WHERE st.tagId = '{$tag['id']}' AND s.status = 'published' ORDER BY s.createdAt DESC");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $stories[] = $row;

header_html('Тег: ' . $tag['name'], 'Сказки с тегом "' . $tag['name'] . '"');
?>

<main class="flex-1 py-8">
    <div class="container mx-auto px-4">
        <?= render_breadcrumbs([['name' => 'Главная', 'url' => '/'], ['name' => 'Теги', 'url' => '/tags'], ['name' => $tag['name']]]) ?>
        <h1 class="text-3xl font-bold mb-6">
            Тег: <?= e($tag['name']) ?>
            <span class="text-gray-400 text-lg ml-2">(<?= $tag['usageCount'] ?>)</span>
        </h1>
        <?php if (empty($stories)): ?>
            <p class="text-gray-500">Сказок с этим тегом пока нет.</p>
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
